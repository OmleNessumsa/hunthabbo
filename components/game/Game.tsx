'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Application, Container, Graphics, Text, TextStyle, FederatedPointerEvent, Rectangle } from 'pixi.js';
import { useGameStore } from '@/hooks/useGameStore';
import { Deal, RoomType } from '@/types';
import {
  TILE_WIDTH,
  TILE_HEIGHT,
  cartesianToIsometric,
  isometricToCartesian,
  distance,
} from '@/lib/isometric';
import { rooms } from '@/lib/mansionMap';
import ProductModal from '@/components/ui/ProductModal';
import HUD from '@/components/ui/HUD';
import RoomNavigation from '@/components/ui/RoomNavigation';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { RemotePlayer } from '@/types/multiplayer';

interface GameProps {
  initialDeals: Deal[];
  playerName: string;
}

// Interaction distance in tiles
const INTERACTION_DISTANCE = 2;

// Room colors
const roomColors: Record<RoomType, number> = {
  garage: 0x4a5568,
  keuken: 0xfaf089,
  woonkamer: 0xb794f4,
  home_office: 0x63b3ed,
  badkamer: 0x4fd1c5,
  entree: 0xf6ad55,
  slaapkamer: 0xfeb2b2,
  tuin: 0x68d391,
};

const wallColors: Record<RoomType, number> = {
  garage: 0x2d3748,
  keuken: 0xd69e2e,
  woonkamer: 0x805ad5,
  home_office: 0x3182ce,
  badkamer: 0x319795,
  entree: 0xdd6b20,
  slaapkamer: 0xc53030,
  tuin: 0x38a169,
};

export default function Game({ initialDeals, playerName }: GameProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const worldContainerRef = useRef<Container | null>(null);
  const avatarGraphicsRef = useRef<Graphics | null>(null);
  const productsContainerRef = useRef<Container | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastInteractedProductRef = useRef<string | null>(null);
  const [nearbyProduct, setNearbyProduct] = useState<Deal | null>(null);
  const remotePlayersContainerRef = useRef<Container | null>(null);
  const remotePlayerGraphicsRef = useRef<Map<string, Container>>(new Map());

  // Multiplayer
  const {
    isConnected,
    remotePlayers,
    chatMessages,
    connect,
    sendPosition,
    sendRoomChange,
    sendChat,
  } = useMultiplayer();

  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const {
    avatar,
    map,
    deals,
    placedProducts,
    selectedProduct,
    showProductModal,
    currentRoom,
    initializeGame,
    moveAvatarTo,
    updateAvatar,
    selectProduct,
    setShowProductModal,
    teleportToRoom,
  } = useGameStore();

  // Initialize game with deals FIRST
  useEffect(() => {
    if (initialDeals.length > 0) {
      console.log('Initializing game with', initialDeals.length, 'deals');
      initializeGame(initialDeals);
    }
  }, [initialDeals, initializeGame]);

  // Connect to multiplayer when player name is set
  useEffect(() => {
    if (playerName && isInitialized) {
      connect(playerName);
    }
  }, [playerName, isInitialized, connect]);

  // Initialize PixiJS AFTER deals are loaded
  useEffect(() => {
    // Wait for deals to be loaded and store to be initialized
    if (!canvasRef.current || appRef.current || initialDeals.length === 0) {
      console.log('PixiJS init skipped:', { hasCanvas: !!canvasRef.current, hasApp: !!appRef.current, dealsCount: initialDeals.length });
      return;
    }
    console.log('Initializing PixiJS...');

    const initPixi = async () => {
      const app = new Application();

      await app.init({
        width: canvasRef.current!.clientWidth,
        height: canvasRef.current!.clientHeight,
        backgroundColor: 0x1a1a2e,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      canvasRef.current!.appendChild(app.canvas);
      appRef.current = app;

      // Enable interactivity on the stage
      app.stage.eventMode = 'static';
      app.stage.hitArea = app.screen;

      // Create world container
      const worldContainer = new Container();
      worldContainer.x = app.screen.width / 2;
      worldContainer.y = app.screen.height / 3;
      worldContainer.eventMode = 'static';
      app.stage.addChild(worldContainer);
      worldContainerRef.current = worldContainer;

      // Draw the static map
      drawMap(worldContainer, app);

      // Create products container (will be populated when deals load)
      const productsContainer = new Container();
      productsContainer.eventMode = 'static';
      worldContainer.addChild(productsContainer);
      productsContainerRef.current = productsContainer;

      // Create remote players container
      const remotePlayersContainer = new Container();
      worldContainer.addChild(remotePlayersContainer);
      remotePlayersContainerRef.current = remotePlayersContainer;

      // Create avatar
      const avatarGraphics = createAvatar();
      worldContainer.addChild(avatarGraphics);
      avatarGraphicsRef.current = avatarGraphics;

      // Position avatar at starting position
      const avatarIso = cartesianToIsometric(10, 10);
      avatarGraphics.x = avatarIso.screenX;
      avatarGraphics.y = avatarIso.screenY - 20;

      // Handle resize
      const handleResize = () => {
        if (app && canvasRef.current) {
          app.renderer.resize(
            canvasRef.current.clientWidth,
            canvasRef.current.clientHeight
          );
          if (worldContainerRef.current) {
            worldContainerRef.current.x = app.screen.width / 2;
            worldContainerRef.current.y = app.screen.height / 3;
          }
        }
      };

      window.addEventListener('resize', handleResize);
      setIsInitialized(true);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    initPixi();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [initialDeals.length]); // Re-run when deals are loaded

  // Draw products when placedProducts changes
  useEffect(() => {
    console.log('Products useEffect triggered:', {
      hasContainer: !!productsContainerRef.current,
      isInitialized,
      placedProductsCount: placedProducts.length,
      dealsCount: deals.length
    });

    if (!productsContainerRef.current || !isInitialized) {
      console.log('Skipping product rendering - not ready');
      return;
    }

    // Clear existing products
    productsContainerRef.current.removeChildren();

    console.log('Drawing', placedProducts.length, 'products');

    // Draw new products
    placedProducts.forEach((product) => {
      const deal = deals.find((d) => d.id === product.dealId);
      if (!deal) return;

      const iso = cartesianToIsometric(product.x, product.y);
      const productGraphics = new Graphics();

      // Product base (3D box effect)
      const boxWidth = 40;
      const boxHeight = 30;
      const boxDepth = 20;

      // Top face
      productGraphics.beginFill(0xff6b00, 0.9);
      productGraphics.moveTo(0, -boxDepth);
      productGraphics.lineTo(boxWidth / 2, boxHeight / 2 - boxDepth);
      productGraphics.lineTo(0, boxHeight - boxDepth);
      productGraphics.lineTo(-boxWidth / 2, boxHeight / 2 - boxDepth);
      productGraphics.closePath();
      productGraphics.endFill();

      // Left face
      productGraphics.beginFill(0xcc5500, 0.9);
      productGraphics.moveTo(-boxWidth / 2, boxHeight / 2 - boxDepth);
      productGraphics.lineTo(-boxWidth / 2, boxHeight / 2);
      productGraphics.lineTo(0, boxHeight);
      productGraphics.lineTo(0, boxHeight - boxDepth);
      productGraphics.closePath();
      productGraphics.endFill();

      // Right face
      productGraphics.beginFill(0xff8533, 0.9);
      productGraphics.moveTo(boxWidth / 2, boxHeight / 2 - boxDepth);
      productGraphics.lineTo(boxWidth / 2, boxHeight / 2);
      productGraphics.lineTo(0, boxHeight);
      productGraphics.lineTo(0, boxHeight - boxDepth);
      productGraphics.closePath();
      productGraphics.endFill();

      // Glow effect
      productGraphics.beginFill(0xff6b00, 0.2);
      productGraphics.drawCircle(0, boxHeight / 2, 35);
      productGraphics.endFill();

      productGraphics.x = iso.screenX;
      productGraphics.y = iso.screenY - 15;
      productGraphics.eventMode = 'none'; // Disable click - proximity only

      productsContainerRef.current!.addChild(productGraphics);
    });

    // Move avatar to top of z-order
    if (avatarGraphicsRef.current && worldContainerRef.current) {
      worldContainerRef.current.removeChild(avatarGraphicsRef.current);
      worldContainerRef.current.addChild(avatarGraphicsRef.current);
    }
  }, [placedProducts, deals, isInitialized, selectProduct]);

  // Draw the isometric map
  const drawMap = (container: Container, app: Application) => {
    const mapGraphics = new Graphics();

    // Calculate map bounds for hit area
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    // Draw each room
    for (const room of rooms) {
      const floorColor = roomColors[room.id];
      const wallColor = wallColors[room.id];

      // Draw floor tiles
      for (let y = room.bounds.startY; y <= room.bounds.endY; y++) {
        for (let x = room.bounds.startX; x <= room.bounds.endX; x++) {
          const tile = map.tiles[y]?.[x];
          if (!tile) continue;

          const iso = cartesianToIsometric(x, y);
          const isWall = tile.type === 'wall';
          const isDoor = tile.type === 'door';

          // Track bounds
          minX = Math.min(minX, iso.screenX - TILE_WIDTH / 2);
          maxX = Math.max(maxX, iso.screenX + TILE_WIDTH / 2);
          minY = Math.min(minY, iso.screenY - TILE_HEIGHT / 2 - (isWall ? 20 : 0));
          maxY = Math.max(maxY, iso.screenY + TILE_HEIGHT / 2);

          // Draw isometric tile (diamond shape)
          mapGraphics.beginFill(isWall ? wallColor : isDoor ? 0xffffff : floorColor, isWall ? 0.9 : 0.8);
          mapGraphics.lineStyle(1, isWall ? 0x000000 : wallColor, 0.5);
          mapGraphics.moveTo(iso.screenX, iso.screenY - TILE_HEIGHT / 2);
          mapGraphics.lineTo(iso.screenX + TILE_WIDTH / 2, iso.screenY);
          mapGraphics.lineTo(iso.screenX, iso.screenY + TILE_HEIGHT / 2);
          mapGraphics.lineTo(iso.screenX - TILE_WIDTH / 2, iso.screenY);
          mapGraphics.closePath();
          mapGraphics.endFill();

          // Add wall height
          if (isWall) {
            const wallHeight = 20;
            mapGraphics.beginFill(wallColor, 0.95);
            mapGraphics.lineStyle(1, 0x000000, 0.3);

            // Left face
            mapGraphics.moveTo(iso.screenX - TILE_WIDTH / 2, iso.screenY);
            mapGraphics.lineTo(iso.screenX - TILE_WIDTH / 2, iso.screenY - wallHeight);
            mapGraphics.lineTo(iso.screenX, iso.screenY - TILE_HEIGHT / 2 - wallHeight);
            mapGraphics.lineTo(iso.screenX, iso.screenY - TILE_HEIGHT / 2);
            mapGraphics.closePath();
            mapGraphics.endFill();

            // Right face
            mapGraphics.beginFill(wallColor, 0.7);
            mapGraphics.moveTo(iso.screenX + TILE_WIDTH / 2, iso.screenY);
            mapGraphics.lineTo(iso.screenX + TILE_WIDTH / 2, iso.screenY - wallHeight);
            mapGraphics.lineTo(iso.screenX, iso.screenY - TILE_HEIGHT / 2 - wallHeight);
            mapGraphics.lineTo(iso.screenX, iso.screenY - TILE_HEIGHT / 2);
            mapGraphics.closePath();
            mapGraphics.endFill();
          }
        }
      }

      // Draw room label
      const centerX = (room.bounds.startX + room.bounds.endX) / 2;
      const centerY = (room.bounds.startY + room.bounds.endY) / 2;
      const labelPos = cartesianToIsometric(centerX, centerY);

      const style = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 12,
        fill: '#ffffff',
        fontWeight: 'bold',
        dropShadow: {
          alpha: 0.5,
          blur: 4,
          color: '#000000',
          distance: 2,
        },
      });

      const label = new Text({ text: room.name, style });
      label.anchor.set(0.5);
      label.x = labelPos.screenX;
      label.y = labelPos.screenY - 30;
      container.addChild(label);
    }

    // Set hit area to cover the entire map
    mapGraphics.hitArea = new Rectangle(minX - 50, minY - 50, maxX - minX + 100, maxY - minY + 100);

    container.addChild(mapGraphics);

    // Make map interactive for clicks
    mapGraphics.eventMode = 'static';
    mapGraphics.cursor = 'pointer';
    mapGraphics.on('pointerdown', (event: FederatedPointerEvent) => {
      handleMapClick(event);
    });
  };

  // Create avatar graphics
  const createAvatar = () => {
    const graphics = new Graphics();

    // Shadow
    graphics.beginFill(0x000000, 0.3);
    graphics.drawEllipse(0, 10, 15, 8);
    graphics.endFill();

    // Legs
    graphics.beginFill(0x2d3748);
    graphics.drawRect(-8, 5, 6, 12);
    graphics.drawRect(2, 5, 6, 12);
    graphics.endFill();

    // Body
    graphics.beginFill(0x4299e1);
    graphics.drawRect(-10, -15, 20, 22);
    graphics.endFill();

    // Head
    graphics.beginFill(0xfed7aa);
    graphics.drawRect(-8, -30, 16, 16);
    graphics.endFill();

    // Hair
    graphics.beginFill(0x2d3748);
    graphics.drawRect(-9, -32, 18, 6);
    graphics.endFill();

    // Eyes
    graphics.beginFill(0x000000);
    graphics.drawRect(-5, -26, 3, 3);
    graphics.drawRect(2, -26, 3, 3);
    graphics.endFill();

    // iBOOD badge
    graphics.beginFill(0xff6b00);
    graphics.drawCircle(8, -8, 6);
    graphics.endFill();

    return graphics;
  };

  // Create remote player graphics with name and color
  const createRemotePlayer = (player: RemotePlayer): Container => {
    const container = new Container();

    // Parse hex color to number
    const colorNum = parseInt(player.color.replace('#', ''), 16);

    const graphics = new Graphics();

    // Shadow
    graphics.beginFill(0x000000, 0.3);
    graphics.drawEllipse(0, 10, 15, 8);
    graphics.endFill();

    // Legs
    graphics.beginFill(0x2d3748);
    graphics.drawRect(-8, 5, 6, 12);
    graphics.drawRect(2, 5, 6, 12);
    graphics.endFill();

    // Body with player color
    graphics.beginFill(colorNum);
    graphics.drawRect(-10, -15, 20, 22);
    graphics.endFill();

    // Head
    graphics.beginFill(0xfed7aa);
    graphics.drawRect(-8, -30, 16, 16);
    graphics.endFill();

    // Hair
    graphics.beginFill(0x2d3748);
    graphics.drawRect(-9, -32, 18, 6);
    graphics.endFill();

    // Eyes
    graphics.beginFill(0x000000);
    graphics.drawRect(-5, -26, 3, 3);
    graphics.drawRect(2, -26, 3, 3);
    graphics.endFill();

    container.addChild(graphics);

    // Name label
    const nameStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 10,
      fill: '#ffffff',
      fontWeight: 'bold',
      dropShadow: {
        alpha: 0.8,
        blur: 2,
        color: '#000000',
        distance: 1,
      },
    });

    const nameLabel = new Text({ text: player.name, style: nameStyle });
    nameLabel.anchor.set(0.5);
    nameLabel.y = -45;
    container.addChild(nameLabel);

    return container;
  };

  // Update remote players rendering
  useEffect(() => {
    if (!remotePlayersContainerRef.current || !isInitialized) return;

    const container = remotePlayersContainerRef.current;
    const existingGraphics = remotePlayerGraphicsRef.current;

    // Remove players that left
    existingGraphics.forEach((playerContainer, playerId) => {
      if (!remotePlayers.find(p => p.id === playerId)) {
        container.removeChild(playerContainer);
        existingGraphics.delete(playerId);
      }
    });

    // Add or update players
    for (const player of remotePlayers) {
      let playerContainer = existingGraphics.get(player.id);

      if (!playerContainer) {
        // Create new player graphics
        playerContainer = createRemotePlayer(player);
        container.addChild(playerContainer);
        existingGraphics.set(player.id, playerContainer);
      }

      // Update position with smooth interpolation
      const iso = cartesianToIsometric(player.x, player.y);
      const targetX = iso.screenX;
      const targetY = iso.screenY - 20;

      // Lerp for smooth movement
      playerContainer.x += (targetX - playerContainer.x) * 0.2;
      playerContainer.y += (targetY - playerContainer.y) * 0.2;
    }
  }, [remotePlayers, isInitialized]);

  // Handle click on map
  const handleMapClick = useCallback((event: FederatedPointerEvent) => {
    if (!worldContainerRef.current) {
      console.log('No world container');
      return;
    }

    const worldContainer = worldContainerRef.current;
    const localPos = worldContainer.toLocal(event.global);

    // Convert screen position to tile coordinates
    const tileX = (localPos.x / (TILE_WIDTH / 2) + localPos.y / (TILE_HEIGHT / 2)) / 2;
    const tileY = (localPos.y / (TILE_HEIGHT / 2) - localPos.x / (TILE_WIDTH / 2)) / 2;

    const targetX = Math.floor(tileX);
    const targetY = Math.floor(tileY);

    console.log('Map clicked:', { localPos, targetX, targetY });

    // Check if tile is walkable
    const currentMap = useGameStore.getState().map;
    if (
      targetX >= 0 &&
      targetX < currentMap.width &&
      targetY >= 0 &&
      targetY < currentMap.height &&
      currentMap.tiles[targetY]?.[targetX]?.walkable
    ) {
      console.log('Moving avatar to:', targetX, targetY);
      useGameStore.getState().moveAvatarTo(targetX, targetY);
    } else {
      console.log('Tile not walkable or out of bounds');
    }
  }, []);

  // Game loop for avatar movement
  useEffect(() => {
    if (!isInitialized) return;

    let lastTime = performance.now();
    let animationId: number;

    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Update avatar position in store
      updateAvatar(deltaTime);

      // Update avatar graphics position
      if (avatarGraphicsRef.current) {
        const state = useGameStore.getState();
        const iso = cartesianToIsometric(state.avatar.x, state.avatar.y);
        avatarGraphicsRef.current.x = iso.screenX;
        avatarGraphicsRef.current.y = iso.screenY - 20;

        // Walking animation
        if (state.avatar.state === 'walking') {
          avatarGraphicsRef.current.y += Math.sin(currentTime / 100) * 2;
        }

        // Proximity detection for products
        const avatarPos = { x: state.avatar.x, y: state.avatar.y };
        let closestProduct: { deal: Deal; dist: number } | null = null;

        for (const product of state.placedProducts) {
          const productPos = { x: product.x, y: product.y };
          const dist = distance(avatarPos, productPos);

          if (dist <= INTERACTION_DISTANCE) {
            const deal = state.deals.find(d => d.id === product.dealId);
            if (deal && (!closestProduct || dist < closestProduct.dist)) {
              closestProduct = { deal, dist };
            }
          }
        }

        // Auto-show modal when approaching a product (with cooldown)
        if (closestProduct) {
          const productId = closestProduct.deal.id;
          if (lastInteractedProductRef.current !== productId) {
            lastInteractedProductRef.current = productId;
            setNearbyProduct(closestProduct.deal);
            selectProduct(closestProduct.deal);
          }
        } else {
          // Reset when walking away
          if (lastInteractedProductRef.current) {
            lastInteractedProductRef.current = null;
            setNearbyProduct(null);
          }
        }

        // Send position to multiplayer server
        sendPosition(state.avatar.x, state.avatar.y);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isInitialized, updateAvatar, selectProduct, sendPosition]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const state = useGameStore.getState();
      const { avatar, map: currentMap } = state;
      let newX = Math.round(avatar.x);
      let newY = Math.round(avatar.y);

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newY -= 1;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newY += 1;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newX -= 1;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newX += 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      console.log('Keyboard move:', { key: e.key, newX, newY });

      if (
        newX >= 0 &&
        newX < currentMap.width &&
        newY >= 0 &&
        newY < currentMap.height &&
        currentMap.tiles[newY]?.[newX]?.walkable
      ) {
        console.log('Moving avatar via keyboard to:', newX, newY);
        state.moveAvatarTo(newX, newY);
      } else {
        console.log('Keyboard: Tile not walkable');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-ibood-dark">
      {/* Game Canvas */}
      <div ref={canvasRef} className="absolute inset-0" />

      {/* HUD - use initialDeals.length for SSR, deals.length for client */}
      <HUD activeDeals={deals.length || initialDeals.length} currentRoom={currentRoom} />

      {/* Room Navigation */}
      <RoomNavigation />

      {/* Product Modal */}
      {showProductModal && selectedProduct && (
        <ProductModal
          deal={selectedProduct}
          onClose={() => setShowProductModal(false)}
        />
      )}

      {/* Chat UI */}
      <div className="absolute bottom-4 left-4 z-30">
        {/* Chat toggle button */}
        <button
          onClick={() => setShowChat(!showChat)}
          className="mb-2 bg-slate-800/90 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>Chat</span>
          {isConnected && (
            <span className="w-2 h-2 bg-green-500 rounded-full" />
          )}
          {!showChat && chatMessages.length > 0 && (
            <span className="bg-ibood-orange text-xs px-2 py-0.5 rounded-full">
              {chatMessages.length}
            </span>
          )}
        </button>

        {/* Chat panel */}
        {showChat && (
          <div className="bg-slate-800/95 rounded-lg w-80 max-h-96 flex flex-col">
            {/* Online players */}
            <div className="px-3 py-2 border-b border-slate-700 text-sm text-slate-400">
              {remotePlayers.length + 1} spelers online
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-64">
              {chatMessages.length === 0 ? (
                <p className="text-slate-500 text-sm text-center">Nog geen berichten</p>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <span className="font-bold text-ibood-orange">{msg.playerName}: </span>
                    <span className="text-white">{msg.text}</span>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (chatInput.trim()) {
                  sendChat(chatInput);
                  setChatInput('');
                }
              }}
              className="p-2 border-t border-slate-700"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Typ een bericht..."
                className="w-full bg-slate-700 text-white px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-ibood-orange"
                maxLength={200}
              />
            </form>
          </div>
        )}
      </div>

      {/* Connection status */}
      {!isConnected && isInitialized && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-yellow-600/90 text-white px-4 py-2 rounded-lg text-sm z-40">
          Verbinden met multiplayer...
        </div>
      )}

      {/* Loading Screen */}
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-ibood-dark z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-ibood-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-xl">Loading Mansion...</p>
            <p className="text-slate-400 text-sm mt-2">
              {initialDeals.length} deals gevonden
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
