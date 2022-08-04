var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames, __getOwnPropSymbols = Object.getOwnPropertySymbols, __getProtoOf = Object.getPrototypeOf, __hasOwnProp = Object.prototype.hasOwnProperty, __propIsEnum = Object.prototype.propertyIsEnumerable;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: !0 });
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    __hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0 && (target[prop] = source[prop]);
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source))
      exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop) && (target[prop] = source[prop]);
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
}, __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 == "object" || typeof module2 == "function")
    for (let key of __getOwnPropNames(module2))
      !__hasOwnProp.call(target, key) && (copyDefault || key !== "default") && __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  return target;
}, __toESM = (module2, isNodeMode) => __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: !0 } : { value: module2, enumerable: !0 })), module2), __toCommonJS = /* @__PURE__ */ ((cache) => (module2, temp) => cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp))(typeof WeakMap != "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// <stdin>
var stdin_exports = {};
__export(stdin_exports, {
  assets: () => assets_manifest_default,
  assetsBuildDirectory: () => assetsBuildDirectory,
  entry: () => entry,
  publicPath: () => publicPath,
  routes: () => routes
});

// node_modules/@remix-run/dev/dist/compiler/shims/react.ts
var React = __toESM(require("react"));

// app/entry.server.tsx
var entry_server_exports = {};
__export(entry_server_exports, {
  default: () => handleRequest
});
var import_stream = require("stream"), import_server = require("react-dom/server"), import_react = require("@remix-run/react"), import_node = require("@remix-run/node"), import_isbot = __toESM(require("isbot")), ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  let callbackName = (0, import_isbot.default)(request.headers.get("user-agent")) ? "onAllReady" : "onShellReady";
  return new Promise((resolve, reject) => {
    let didError = !1, { pipe, abort } = (0, import_server.renderToPipeableStream)(/* @__PURE__ */ React.createElement(import_react.RemixServer, {
      context: remixContext,
      url: request.url
    }), {
      [callbackName]() {
        let body = new import_stream.PassThrough();
        responseHeaders.set("Content-Type", "text/html"), resolve(new import_node.Response(body, {
          status: didError ? 500 : responseStatusCode,
          headers: responseHeaders
        })), pipe(body);
      },
      onShellError(err) {
        reject(err);
      },
      onError(error) {
        didError = !0, console.error(error);
      }
    });
    setTimeout(abort, ABORT_DELAY);
  });
}

// route:C:\Users\jreis\Desktop\Sites\poker-world\app\root.tsx
var root_exports = {};
__export(root_exports, {
  default: () => App,
  links: () => links,
  loader: () => loader,
  meta: () => meta
});
var import_node3 = require("@remix-run/node"), import_react3 = require("@remix-run/react");

// app/styles/tailwind.css
var tailwind_default = "/build/_assets/tailwind-6QK26W7A.css";

// app/session.server.ts
var import_node2 = require("@remix-run/node"), import_tiny_invariant = __toESM(require("tiny-invariant"));

// app/models/user.server.ts
var import_bcryptjs = __toESM(require("bcryptjs"));

// app/db.server.ts
var import_client = require("@prisma/client"), prisma;
prisma = new import_client.PrismaClient();

// app/models/user.server.ts
async function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}
async function getUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}
async function createUser(email, password) {
  let hashedPassword = await import_bcryptjs.default.hash(password, 10);
  return prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword
        }
      }
    }
  });
}
async function verifyLogin(email, password) {
  let userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: !0
    }
  });
  if (!userWithPassword || !userWithPassword.password || !await import_bcryptjs.default.compare(password, userWithPassword.password.hash))
    return null;
  let _a = userWithPassword, { password: _password } = _a;
  return __objRest(_a, ["password"]);
}

// app/session.server.ts
(0, import_tiny_invariant.default)(process.env.SESSION_SECRET, "SESSION_SECRET must be set");
var sessionStorage = (0, import_node2.createCookieSessionStorage)({
  cookie: {
    name: "__session",
    httpOnly: !0,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: !0
  }
}), USER_SESSION_KEY = "userId";
async function getSession(request) {
  let cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}
async function getUserId(request) {
  return (await getSession(request)).get(USER_SESSION_KEY);
}
async function getUser(request) {
  let userId = await getUserId(request);
  if (userId === void 0)
    return null;
  let user = await getUserById(userId);
  if (user)
    return user;
  throw await logout(request);
}
async function requireUserId(request, redirectTo = new URL(request.url).pathname) {
  let userId = await getUserId(request);
  if (!userId) {
    let searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw (0, import_node2.redirect)(`/login?${searchParams}`);
  }
  return userId;
}
async function createUserSession({
  request,
  userId,
  remember,
  redirectTo
}) {
  let session = await getSession(request);
  return session.set(USER_SESSION_KEY, userId), (0, import_node2.redirect)(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember ? 60 * 60 * 24 * 7 : void 0
      })
    }
  });
}
async function logout(request) {
  let session = await getSession(request);
  return (0, import_node2.redirect)("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session)
    }
  });
}

// route:C:\Users\jreis\Desktop\Sites\poker-world\app\root.tsx
var import_react4 = require("react"), import_socket = require("socket.io-client");

// app/context.tsx
var import_react2 = require("react"), context = (0, import_react2.createContext)(void 0);
function useSocket() {
  return (0, import_react2.useContext)(context);
}
function SocketProvider({ socket, children }) {
  return /* @__PURE__ */ React.createElement(context.Provider, {
    value: socket
  }, children);
}

// route:C:\Users\jreis\Desktop\Sites\poker-world\app\root.tsx
var links = () => [{ rel: "stylesheet", href: tailwind_default }], meta = () => ({
  charset: "utf-8",
  title: "Remix Notes",
  viewport: "width=device-width,initial-scale=1"
});
async function loader({ request }) {
  return (0, import_node3.json)({
    user: await getUser(request)
  });
}
function App() {
  let [socket, setSocket] = (0, import_react4.useState)();
  return (0, import_react4.useEffect)(() => {
    let socket2 = (0, import_socket.io)();
    return setSocket(socket2), () => {
      socket2.close();
    };
  }, []), /* @__PURE__ */ React.createElement("html", {
    lang: "en",
    className: "h-full"
  }, /* @__PURE__ */ React.createElement("head", null, /* @__PURE__ */ React.createElement(import_react3.Meta, null), /* @__PURE__ */ React.createElement(import_react3.Links, null)), /* @__PURE__ */ React.createElement("body", {
    className: "h-full"
  }, /* @__PURE__ */ React.createElement(SocketProvider, {
    socket
  }, /* @__PURE__ */ React.createElement(import_react3.Outlet, null)), /* @__PURE__ */ React.createElement(import_react3.ScrollRestoration, null), /* @__PURE__ */ React.createElement(import_react3.Scripts, null), /* @__PURE__ */ React.createElement(import_react3.LiveReload, null)));
}

// route:C:\Users\jreis\Desktop\Sites\poker-world\app\routes\healthcheck.tsx
var healthcheck_exports = {};
__export(healthcheck_exports, {
  loader: () => loader2
});
async function loader2({ request }) {
  let host = request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");
  try {
    let url = new URL("/", `http://${host}`);
    return await Promise.all([
      prisma.user.count(),
      fetch(url.toString(), { method: "HEAD" }).then((r) => {
        if (!r.ok)
          return Promise.reject(r);
      })
    ]), new Response("OK");
  } catch (error) {
    return console.log("healthcheck \u274C", { error }), new Response("ERROR", { status: 500 });
  }
}

// route:C:\Users\jreis\Desktop\Sites\poker-world\app\routes\logout.tsx
var logout_exports = {};
__export(logout_exports, {
  action: () => action,
  loader: () => loader3
});
var import_node4 = require("@remix-run/node");
async function action({ request }) {
  return logout(request);
}
async function loader3() {
  return (0, import_node4.redirect)("/");
}

// route:C:\Users\jreis\Desktop\Sites\poker-world\app\routes\index.tsx
var routes_exports = {};
__export(routes_exports, {
  default: () => Index,
  links: () => links2,
  meta: () => meta2
});
var import_Alert = __toESM(require("@mui/material/Alert")), import_Snackbar = __toESM(require("@mui/material/Snackbar")), import_react6 = require("react");

// app/components/Card.tsx
function Card(props) {
  let { rank, suit, faceUp, folded, winner = !1 } = props, getUnicodeSuit = (inputSuit) => {
    switch (inputSuit) {
      case "spades":
        return "\u2660";
      case "hearts":
        return "\u2665";
      case "diams":
        return "\u2666";
      case "clubs":
        return "\u2663";
      default:
        return null;
    }
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: `relative p-0 ${winner ? "-mt-8 transition-all duration-1000" : ""}`
  }, /* @__PURE__ */ React.createElement("div", {
    className: `card rank-${rank} ${suit} ${winner ? "winner border-4 border-lime-500" : ""}`
  }, /* @__PURE__ */ React.createElement("span", {
    className: "rank"
  }, rank), /* @__PURE__ */ React.createElement("span", {
    className: "suit"
  }, getUnicodeSuit(suit))), !faceUp && /* @__PURE__ */ React.createElement("div", {
    className: "absolute top-0"
  }, /* @__PURE__ */ React.createElement("div", {
    className: `card back ${folded ? "folded" : ""}`
  })));
}

// app/components/PlayerDisplay.tsx
var import_react5 = require("react");
function PlayerDisplay(props) {
  let { player, active, onTimeout, prevPlayer, gameOver, wonAmount = 0 } = props, [progressCreated, setProgressCreated] = (0, import_react5.useState)(!1), createProgressbar = (id, duration, callback) => {
    var progressbar = document.getElementById(id);
    if (progressbar) {
      progressbar.className = "progressbar";
      var progressbarinner = document.createElement("div");
      progressbarinner.className = "inner", progressbarinner.style.animationDuration = duration, typeof callback == "function" && progressbarinner.addEventListener("animationend", callback), progressbar == null || progressbar.appendChild(progressbarinner), progressbarinner.style.animationPlayState = "running";
    }
  };
  return (0, import_react5.useEffect)(() => {
    gameOver || createProgressbar("progressbar", "30s", function() {
      onTimeout();
    });
  }), /* @__PURE__ */ React.createElement("div", {
    className: "flex flex-col z-1"
  }, /* @__PURE__ */ React.createElement("div", {
    className: `w-[135px] max-w-[100vw] rounded-t-2xl bg-black p-1 text-center text-white ${active && !gameOver ? "border-x-4 border-t-4 border-x-lime-500 border-t-lime-500" : null}`
  }, `${player.name}`), /* @__PURE__ */ React.createElement("div", {
    className: `mb-1 w-[135px] max-w-[100vw] rounded-b-2xl bg-white p-1 text-center text-black ${active && !gameOver ? "border-x-4 border-b-4 border-x-lime-500 border-b-lime-500" : null}`
  }, wonAmount > 0 ? `${player.chips} + ${wonAmount}` : `${player.chips}`), active ? /* @__PURE__ */ React.createElement("div", {
    id: "progressbar"
  }) : /* @__PURE__ */ React.createElement("div", {
    className: "m-[10px] h-[20px] w-full"
  }));
}

// app/components/Table.tsx
function Table() {
  return /* @__PURE__ */ React.createElement("div", {
    className: "self-center min-w-full min-h-full flex flex-col items-center justify-center -z-1"
  }, /* @__PURE__ */ React.createElement("img", {
    src: "images/table.png",
    alt: "table",
    className: "relative object-cover"
  }));
}

// app/styles/cards.css
var cards_default = "/build/_assets/cards-QAW4UE2N.css";

// app/styles/progress.css
var progress_default = "/build/_assets/progress-4XQ5EFCP.css";

// route:C:\Users\jreis\Desktop\Sites\poker-world\app\routes\index.tsx
var links2 = () => [
  { rel: "stylesheet", href: cards_default },
  { rel: "stylesheet", href: progress_default }
], meta2 = () => ({
  charset: "utf-8",
  title: "Poker World",
  viewport: "width=device-width,initial-scale=1"
}), GameState = Object.freeze({
  Preflop: 0,
  Flop: 1,
  Turn: 2,
  River: 3,
  Showdown: 4
}), initialPlayers = [
  {
    name: "riceflair",
    chips: 1e3,
    cards: [],
    folded: !1
  },
  {
    name: "misterbrother",
    chips: 1e3,
    cards: [],
    folded: !1
  },
  {
    name: "copsucker",
    chips: 1e3,
    cards: [],
    folded: !1
  }
];
function Index() {
  let [gameState, setGameState] = (0, import_react6.useState)(GameState.Preflop), socket = useSocket(), [gameStarted, setGameStarted] = (0, import_react6.useState)(!1), [bet, setBet] = (0, import_react6.useState)(0), [dealerCards, setDealerCards] = (0, import_react6.useState)([]), [isSnackbarOpen, setIsSnackbarOpen] = (0, import_react6.useState)(!1), [snackbarMessage, setSnackbarMessage] = (0, import_react6.useState)(""), [dealtCards, setDealtCards] = (0, import_react6.useState)([]), [players, setPlayers] = (0, import_react6.useState)(initialPlayers), [activePlayerIndex, setActivePlayerIndex] = (0, import_react6.useState)(1), [activePlayer, setActivePlayer] = (0, import_react6.useState)(initialPlayers[activePlayerIndex]), [dealer, setDealer] = (0, import_react6.useState)(initialPlayers[0]), [littleBlind, setLittleBlind] = (0, import_react6.useState)(initialPlayers[1]), [bigBlind, setBigBlind] = (0, import_react6.useState)(initialPlayers[2]), [pots, setPots] = (0, import_react6.useState)([0]), [activeBet, setActiveBet] = (0, import_react6.useState)(0), [turnNumber, setTurnNumber] = (0, import_react6.useState)(0), [blinds, setBlinds] = (0, import_react6.useState)([10, 20]), [winner, setWinner] = (0, import_react6.useState)(null), [gameOver, setGameOver] = (0, import_react6.useState)(!1), [hands, setHands] = (0, import_react6.useState)([]), [activePlayerCount, setActivePlayerCount] = (0, import_react6.useState)(3), [winningCards, setWinningCards] = (0, import_react6.useState)([]), [wonAmount, setWonAmount] = (0, import_react6.useState)(0), [playerName, setPlayerName] = (0, import_react6.useState)(""), [buttonClicked, setButtonClicked] = (0, import_react6.useState)(!1), [playerCount, setPlayerCount] = (0, import_react6.useState)(0), [messageSent, setMessageSent] = (0, import_react6.useState)(!1), [socketConnected, setSocketConnected] = (0, import_react6.useState)(!1), [playerNames, setPlayerNames] = (0, import_react6.useState)([]), [playerSocket, setPlayerSocket] = (0, import_react6.useState)(), [playerSockets, setPlayerSockets] = (0, import_react6.useState)([]), [player, setPlayer] = (0, import_react6.useState)(), [joinedGame, setJoinedGame] = (0, import_react6.useState)(!1), [turnsThisRound, setTurnsThisRound] = (0, import_react6.useState)(3), [turnsNextRound, setTurnsNextRound] = (0, import_react6.useState)(3), [earlyWin, setEarlyWin] = (0, import_react6.useState)(!1), handleCheckOrCall = () => {
    let tempPlayers = [...players], tempActivePlayer = tempPlayers.find((tempP) => tempP.name === activePlayer.name);
    tempActivePlayer.chips -= activeBet;
    let tempPots = [...pots];
    tempPots[0] += activeBet;
    let advanceProps = getNextPlayerProps(), checkOrCallProps = {
      players: tempPlayers,
      pots: tempPots,
      prevActivePlayerIndex: advanceProps.prevActivePlayerIndex,
      activePlayerIndex: advanceProps.activePlayerIndex,
      activePlayer: advanceProps.activePlayer,
      turnNumber,
      playerSocket,
      gameState,
      dealerCards,
      activeBet,
      turnsThisRound,
      hands
    };
    socket.emit("playerCheckedOrCalled", checkOrCallProps);
  };
  (0, import_react6.useEffect)(() => {
    if (!socket)
      return;
    let advance = (tn, data, type) => {
      let tempTurnNumber = tn;
      if (type === "BET" && (tempTurnNumber = 0, setTurnNumber(0)), type === "FOLD" && setActivePlayerCount((prev) => prev - 1), data.players.filter((p) => !p.folded).length === 1) {
        endRound(data);
        return;
      }
      tempTurnNumber >= data.turnsThisRound - 1 ? (data.activePlayer.socket === (socket == null ? void 0 : socket.id) && advanceGame(data), setTurnNumber(0)) : setTurnNumber((prev) => prev + 1);
    };
    socket.on("confirmation", (data) => {
      setPlayerNames(data.playerNames), setPlayerSockets(data.playerSockets), setPlayerCount(data.playerNames.length);
    }), socket.on("playerDisconnect", (data) => {
      setPlayerNames(data.playerNames), setPlayerSockets(data.playerSockets), setPlayerCount(data.playerNames.length);
    }), socket.on("playerJoined", (data) => {
      setPlayerNames((prevPN) => [...prevPN, data.playerName]), setPlayerSockets((prevPS) => [...prevPS, data.socket]), data.socket === socket.id && (setPlayerSocket(data.socket), setPlayer(data), setJoinedGame(!0));
      let newPlayerCount = 0;
      setPlayerCount((prevPC) => (newPlayerCount = prevPC + 1, newPlayerCount)), setButtonClicked(!1);
    }), socket.on("sendHoldEmData", (data) => {
      setGameState(data.gameState), setGameStarted(data.gameStarted), setGameOver(data.gameOver), setDealtCards(data.dealtCards), setDealerCards(data.dealerCards), setPlayers(data.players), setDealer(data.dealer), setLittleBlind(data.littleBlind), setBigBlind(data.bigBlind), setActivePlayerIndex(1), setActivePlayer(data.players[1]);
    }), socket.on("sendBetData", (data) => {
      setPots(data.pots), setPlayers(data.players), setActiveBet(data.activeBet), setActivePlayerIndex(data.activePlayerIndex), setActivePlayer(data.activePlayer), setSnackbarMessage(`${data.players[data.prevActivePlayerIndex].name} bet ${data.activeBet}`), setIsSnackbarOpen(!0);
      let advanceDataProps = {
        activePlayer: data.activePlayer,
        gameState: data.gameState,
        dealerCards: data.dealerCards,
        players: data.players,
        hands: data.hands,
        pots: data.pots,
        activeBet: data.activeBet,
        turnsNextRound: data.turnsNextRound,
        turnsThisRound: data.turnsThisRound
      };
      advance(data.turnNumber, advanceDataProps, "BET");
    }), socket.on("sendShowCardsData", (data) => {
      setPlayers(data.players);
    }), socket.on("sendCheckOrCallData", (data) => {
      setPots(data.pots), setPlayers(data.players), setGameState(data.gameState), setActivePlayerIndex(data.activePlayerIndex), setActivePlayer(data.activePlayer), setSnackbarMessage(data.activeBet ? `${data.players[data.prevActivePlayerIndex].name} called $${data.activeBet}` : `${data.players[data.prevActivePlayerIndex].name} checked`), setIsSnackbarOpen(!0);
      let advanceDataProps = {
        activePlayer: data.activePlayer,
        gameState: data.gameState,
        dealerCards: data.dealerCards,
        players: data.players,
        hands: data.hands,
        pots: data.pots,
        turnsNextRound,
        turnsThisRound: data.turnsThisRound
      };
      advance(data.turnNumber, advanceDataProps, "CHECK");
    }), socket.on("sendFoldData", (data) => {
      setPlayers(data.players), setGameState(data.gameState), setActivePlayerIndex(data.activePlayerIndex), setActivePlayer(data.activePlayer), setTurnsNextRound(data.turnsNextRound), setSnackbarMessage(`${data.players[data.prevActivePlayerIndex].name} folded`), setIsSnackbarOpen(!0);
      let advanceDataProps = {
        activePlayer: data.activePlayer,
        gameState: data.gameState,
        dealerCards,
        players: data.players,
        hands: data.hands,
        pots,
        turnsNextRound: data.turnsNextRound - 1,
        turnsThisRound: data.turnsThisRound
      };
      advance(data.turnNumber, advanceDataProps, "FOLD");
    }), socket.on("sendEndRoundData", (data) => {
      setActiveBet(0), setGameState(data.gameState), setActivePlayerCount(data.turnsNextRound), setTurnsThisRound(data.turnsNextRound), setTurnsNextRound(3), setEarlyWin(!0), data.winner && (setWinner(data.winner), setWinningCards(data.winningCards), setWonAmount(data.wonAmount)), setHands(data.hands), setPlayers(data.players), setGameOver(data.gameOver);
    }), socket.on("sendAdvanceData", (data) => {
      setActiveBet(0), setGameState(data.gameState), setDealerCards(data.dealerCards), setActivePlayerCount(data.turnsNextRound), setTurnsThisRound(data.turnsNextRound), setTurnsNextRound(3), data.winner && (setWinner(data.winner), setWinningCards(data.winningCards), setWonAmount(data.wonAmount)), setHands(data.hands), setPlayers(data.players), setGameOver(data.gameOver);
    }), socket.on("sendAdvanceHandsData", (data) => {
      setGameState(GameState.Preflop), setGameStarted(!0), setGameOver(!1), setDealtCards([]), setDealerCards([]), setWinningCards([]), setWinner(null), setWonAmount(0), setTurnNumber(0), setEarlyWin(!1), setActivePlayerCount(3), setTurnsThisRound(3), setTurnsNextRound(3), setPlayers(data.players), setHands(data.hands);
      let nextDealerIndex = data.hands.length % data.players.length, nextLittleBlindIndex = (data.hands.length + 1) % data.players.length, nextBigBlindIndex = (data.hands.length + 2) % data.players.length;
      setDealer(data.players[nextDealerIndex]), setLittleBlind(data.players[nextLittleBlindIndex]), setBigBlind(data.players[nextBigBlindIndex]), setActivePlayerIndex(nextLittleBlindIndex), setActivePlayer(data.players[nextLittleBlindIndex]), setPots([0]);
    });
  }, [socket]), (0, import_react6.useEffect)(() => {
    if (playerCount === 3 && playerSocket === playerSockets[2]) {
      let startProps = {
        playerNames,
        playerSockets,
        playerChips: players.map((p) => p.chips),
        pastHands: hands
      };
      socket.emit("startHoldEmGame", startProps);
    }
  }, [playerCount]), (0, import_react6.useEffect)(() => {
    if (buttonClicked) {
      if (!socket)
        return;
      socket.emit("playerJoined", { newPlayerName: playerName });
    }
  }, [buttonClicked]);
  let handleJoinGame = () => {
    setButtonClicked(!0);
  }, handleFold = () => {
    let tempPlayers = [...players], tempActivePlayer = tempPlayers.find((player2) => player2.name === activePlayer.name);
    tempActivePlayer.cards = tempActivePlayer.cards.map((card) => (card.faceUp = !1, card)), tempActivePlayer.folded = !0;
    let advanceProps = getNextPlayerProps(), foldProps = {
      players: tempPlayers,
      activePlayerIndex: advanceProps.activePlayerIndex,
      activePlayer: advanceProps.activePlayer,
      prevActivePlayerIndex: advanceProps.prevActivePlayerIndex,
      turnNumber,
      playerSocket,
      gameState,
      turnsNextRound: turnsNextRound - 1,
      turnsThisRound: turnsNextRound,
      hands
    };
    socket.emit("playerFolded", foldProps);
  }, handleBet = (amount) => {
    let tempPlayers = [...players], tempActivePlayer = tempPlayers.find((player2) => player2.name === activePlayer.name);
    tempActivePlayer.chips -= amount;
    let tempPots = [...pots];
    tempPots[0] += amount;
    let advanceProps = getNextPlayerProps(), betProps = {
      players: tempPlayers,
      pots: tempPots,
      prevActivePlayerIndex: advanceProps.prevActivePlayerIndex,
      activePlayerIndex: advanceProps.activePlayerIndex,
      activePlayer: advanceProps.activePlayer,
      turnNumber,
      playerSocket,
      gameState,
      dealerCards,
      activeBet: amount,
      turnsNextRound,
      turnsThisRound,
      hands
    };
    socket.emit("playerBet", betProps);
  }, handlePlayerTimeout = (player2) => {
    playerSocket === player2.socket && handleFold(), setSnackbarMessage(`${player2.name} timed out and auto-folded`), setIsSnackbarOpen(!0);
  }, getNextPlayerProps = () => {
    let tempActivePlayerIndex = activePlayerIndex, activePlayerIndicies = [];
    players.map((p, index) => {
      p.folded || activePlayerIndicies.push(index);
    });
    let nextActivePlayerIndex = tempActivePlayerIndex;
    for (let i = 0; i < activePlayerIndicies.length; i++)
      if (activePlayerIndicies[i] > nextActivePlayerIndex) {
        nextActivePlayerIndex = activePlayerIndicies[i];
        break;
      }
    return nextActivePlayerIndex === tempActivePlayerIndex && (nextActivePlayerIndex = activePlayerIndicies[0]), {
      prevActivePlayerIndex: activePlayerIndex,
      activePlayerIndex: nextActivePlayerIndex,
      activePlayer: players[nextActivePlayerIndex]
    };
  }, endRound = (data) => {
    socket.emit("endRound", data);
  }, advanceGame = (data) => {
    socket.emit("advanceHoldEmGame", data);
  }, handleClose = () => {
    setIsSnackbarOpen(!1);
  }, advanceHands = () => {
    socket.emit("advanceHands", { players, hands, playerSockets });
  }, handleShowCards = (player2) => {
    let tempPlayers = [...players];
    tempPlayers.filter((p) => p.socket === player2.socket).map((p) => p.cards).forEach((cardArray) => {
      cardArray.forEach((card) => {
        card.faceUp = !0;
      });
    }), socket.emit("showCards", { players: tempPlayers });
  }, handleMuckCards = () => {
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_Snackbar.default, {
    open: isSnackbarOpen,
    autoHideDuration: 3e3,
    onClose: handleClose,
    key: snackbarMessage
  }, /* @__PURE__ */ React.createElement(import_Alert.default, {
    className: "rounded-full",
    onClose: handleClose,
    sx: { width: "100%" }
  }, snackbarMessage)), /* @__PURE__ */ React.createElement("main", {
    className: "relative min-h-screen bg-[rgb(0,90,0)] flex items-center justify-center"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "relative sm:pb-16 sm:pt-8"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "mx-auto flex h-[100vh] w-[100vw] flex-col"
  }, !gameStarted && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("input", {
    placeholder: "Enter player name",
    type: "text",
    value: playerName,
    onChange: (e) => setPlayerName(e.target.value),
    className: "absolute mt-24 self-center rounded bg-black px-4 py-2 text-white"
  }), /* @__PURE__ */ React.createElement("button", {
    className: `absolute self-center rounded bg-black px-4 py-2 text-white active:bg-white active:text-black ${joinedGame ? "disabled" : ""}`,
    onClick: handleJoinGame,
    disabled: joinedGame
  }, joinedGame ? "Joined, awaiting players" : "Join Game"), /* @__PURE__ */ React.createElement("div", {
    className: "absolute mt-[30%] self-center text-6xl text-black"
  }, playerNames.join(", "))), gameOver && /* @__PURE__ */ React.createElement("button", {
    id: "next-btn",
    className: "absolute self-center rounded bg-black px-4 py-2 text-white active:bg-white active:text-black",
    onClick: () => advanceHands()
  }, "Next Hand"), gameStarted ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Table, null), /* @__PURE__ */ React.createElement("div", {
    className: "flex flex-col items-center justify-center"
  }, /* @__PURE__ */ React.createElement("div", {
    className: `absolute top-[20%] w-full items-center justify-center self-center text-center text-3xl text-white transition-all duration-[1000ms] ${winner ? "opacity-100" : "opacity-0"}`
  }, /* @__PURE__ */ React.createElement("h1", null, winner ? winner.description : null)), /* @__PURE__ */ React.createElement("div", {
    className: "absolute top-[30%] w-[100vw] items-center justify-center self-center text-center text-xl"
  }, `Blinds: ${blinds[0]}/${blinds[1]} \u2022 Pot: ${pots.join(", ")} \u2022 Hand #${hands.length + 1}`), /* @__PURE__ */ React.createElement("div", {
    className: "playingCards simpleCards absolute bottom-[48%] z-[9999] flex w-[100vw] flex-row items-center justify-center"
  }, dealerCards.map((card, index) => /* @__PURE__ */ React.createElement(Card, {
    key: `${index}-${card.suit}-${card.rank}`,
    suit: card.suit,
    rank: card.rank,
    faceUp: card.faceUp,
    folded: card.faceUp,
    winner: winningCards.length > 0 ? winningCards.filter((w) => w.suit == card.suit.charAt(0) && w.value.toString().replace("T", "10") === card.rank).length > 0 : !1
  })))), /* @__PURE__ */ React.createElement("div", {
    className: "flex flex-col gap-1"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "fixed bottom-[47vh] right-[35vw] flex w-[100vw] flex-col items-center justify-center z-[4000]"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "playingCards simpleCards flex flex-row items-center justify-center"
  }, players[1].cards.map((card, index) => /* @__PURE__ */ React.createElement(Card, {
    key: `${index}-${card.suit}-${card.rank}`,
    suit: card.suit,
    rank: card.rank,
    faceUp: !players[1].folded && players[1].socket === playerSocket || card.faceUp,
    folded: players[1].folded,
    winner: winningCards.length > 0 ? winningCards.filter((w) => w.suit == card.suit.charAt(0) && w.value.toString().replace("T", "10") === card.rank).length > 0 : !1
  }))), /* @__PURE__ */ React.createElement(PlayerDisplay, {
    player: players[1],
    active: activePlayer.name === players[1].name && !gameOver,
    onTimeout: () => handlePlayerTimeout(players[1]),
    prevPlayer: players[0],
    gameOver
  })), dealer.name === players[1].name ? /* @__PURE__ */ React.createElement("div", {
    className: "absolute bottom-[50%] flex w-[100vw] flex-row pl-8 z-0"
  }, /* @__PURE__ */ React.createElement("img", {
    src: "images/black-dealer-button.png",
    alt: "dealer",
    className: "relative object-cover"
  })) : littleBlind.name === players[1].name ? /* @__PURE__ */ React.createElement("div", {
    className: "absolute bottom-[50%] flex w-[100vw] flex-row pl-8 z-0"
  }, /* @__PURE__ */ React.createElement("img", {
    src: "images/littleblind.png",
    alt: "little blind",
    width: "50px",
    height: "50px",
    className: "relative object-cover"
  })) : bigBlind.name === players[1].name ? /* @__PURE__ */ React.createElement("div", {
    className: "absolute bottom-[50%] flex w-[100vw] flex-row pl-8 z-0"
  }, /* @__PURE__ */ React.createElement("img", {
    src: "images/bigblind.png",
    alt: "big blind",
    width: "50px",
    height: "50px",
    className: "relative object-cover"
  })) : null), /* @__PURE__ */ React.createElement("div", {
    className: "flex flex-col gap-1"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "fixed bottom-[47vh] left-[35vw] flex w-[100vw] flex-col items-center justify-center z-[4000]"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "playingCards simpleCards flex flex-row items-center justify-center"
  }, players[2].cards.map((card, index) => /* @__PURE__ */ React.createElement(Card, {
    key: `${index}-${card.suit}-${card.rank}`,
    suit: card.suit,
    rank: card.rank,
    faceUp: !players[2].folded && players[2].socket === playerSocket || card.faceUp,
    folded: players[2].folded,
    winner: winningCards.length > 0 ? winningCards.filter((w) => w.suit == card.suit.charAt(0) && w.value.toString().replace("T", "10") === card.rank).length > 0 : !1
  }))), /* @__PURE__ */ React.createElement(PlayerDisplay, {
    player: players[2],
    active: activePlayer.name === players[2].name && !gameOver,
    onTimeout: () => handlePlayerTimeout(players[2]),
    prevPlayer: players[1],
    gameOver
  })), dealer.name === players[2].name ? /* @__PURE__ */ React.createElement("div", {
    className: "absolute bottom-[50%] flex w-[100vw] flex-row items-end justify-end pr-8 z-0"
  }, /* @__PURE__ */ React.createElement("img", {
    src: "images/black-dealer-button.png",
    alt: "dealer",
    className: "relative object-cover"
  })) : littleBlind.name === players[2].name ? /* @__PURE__ */ React.createElement("div", {
    className: "absolute bottom-[50%] flex w-[100vw] flex-row items-end justify-end pr-8 z-0"
  }, /* @__PURE__ */ React.createElement("img", {
    src: "images/littleblind.png",
    alt: "little blind",
    width: "50px",
    height: "50px",
    className: "relative object-cover"
  })) : bigBlind.name === players[2].name ? /* @__PURE__ */ React.createElement("div", {
    className: "absolute bottom-[50%] flex w-[100vw] flex-row items-end justify-end pr-8 z-0"
  }, /* @__PURE__ */ React.createElement("img", {
    src: "images/bigblind.png",
    alt: "big blind",
    width: "50px",
    height: "50px",
    className: "relative object-cover"
  })) : null), /* @__PURE__ */ React.createElement("div", {
    className: "playingCards simpleCards fixed bottom-[20%] flex w-[100vw] flex-row items-center justify-center"
  }, players[0].cards.map((card, index) => /* @__PURE__ */ React.createElement(Card, {
    key: `${index}-${card.suit}-${card.rank}`,
    suit: card.suit,
    rank: card.rank,
    faceUp: !players[0].folded && players[0].socket === playerSocket || card.faceUp,
    folded: players[0].folded,
    winner: winningCards.length > 0 ? winningCards.filter((w) => w.suit == card.suit.charAt(0) && w.value.toString().replace("T", "10") === card.rank).length > 0 : !1
  }))), /* @__PURE__ */ React.createElement("div", {
    className: "fixed bottom-[7.5%] flex w-[100vw] flex-col items-center justify-center z-[4000]"
  }, /* @__PURE__ */ React.createElement(PlayerDisplay, {
    player: players[0],
    active: activePlayer.name === players[0].name && !gameOver,
    onTimeout: () => handlePlayerTimeout(players[0]),
    prevPlayer: players[players.length - 1],
    gameOver
  })), dealer.name === players[0].name ? /* @__PURE__ */ React.createElement("div", {
    className: "absolute bottom-[1%] flex w-[100vw] flex-row items-center justify-center z-0"
  }, /* @__PURE__ */ React.createElement("img", {
    src: "images/black-dealer-button.png",
    alt: "dealer",
    className: "relative object-cover"
  })) : littleBlind.name === players[0].name ? /* @__PURE__ */ React.createElement("div", {
    className: "absolute bottom-[1%] flex w-[100vw] flex-row items-center justify-center z-0"
  }, /* @__PURE__ */ React.createElement("img", {
    src: "images/littleblind.png",
    alt: "little blind",
    width: "50px",
    height: "50px",
    className: "relative object-cover"
  })) : bigBlind.name === players[0].name ? /* @__PURE__ */ React.createElement("div", {
    className: "absolute bottom-[1%] flex w-[100vw] flex-row items-center justify-center z-0"
  }, /* @__PURE__ */ React.createElement("img", {
    src: "images/bigblind.png",
    alt: "big blind",
    width: "50px",
    height: "50px",
    className: "relative object-cover"
  })) : null, !gameOver && activePlayer.socket === playerSocket ? /* @__PURE__ */ React.createElement("div", {
    className: "fixed bottom-[10%] right-0 flex w-[220px] flex-row items-end justify-end pr-8 z-[10999]"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "flex w-[100%] flex-row items-end"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "m-2"
  }, /* @__PURE__ */ React.createElement("input", {
    type: "range",
    className: "form-range w-full p-0 focus:shadow-none focus:outline-none focus:ring-0",
    min: "0",
    max: "100",
    value: bet,
    onChange: (event) => {
      setBet(+event.target.value);
    }
  })), /* @__PURE__ */ React.createElement("div", {
    className: "flex-1"
  }), /* @__PURE__ */ React.createElement("button", {
    className: "rounded bg-transparent px-4 py-2 text-white"
  }, "$", bet)), /* @__PURE__ */ React.createElement("div", {
    className: "fixed bottom-[5%] flex w-[100vw] flex-row items-end justify-end"
  }, /* @__PURE__ */ React.createElement("button", {
    className: "mr-1 rounded bg-black px-4 py-2 text-white active:bg-white active:text-black",
    onClick: handleFold
  }, "Fold"), /* @__PURE__ */ React.createElement("button", {
    className: "mr-1 rounded bg-black px-4 py-2 text-white active:bg-white active:text-black",
    onClick: handleCheckOrCall
  }, activeBet > 0 ? `Call $${activeBet}` : "Check"), /* @__PURE__ */ React.createElement("button", {
    className: "rounded bg-black px-4 py-2 text-white active:bg-white active:text-black",
    onClick: () => handleBet(bet)
  }, "Bet"))) : null, gameOver && earlyWin && winner && winner.winner.players.map((p) => p.player.socket).includes(player.socket) ? /* @__PURE__ */ React.createElement("div", {
    className: "fixed bottom-[10%] right-0 flex w-[220px] flex-row items-end justify-end pr-8 z-[10999]"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "fixed bottom-[5%] flex w-[100vw] flex-row items-end justify-end"
  }, /* @__PURE__ */ React.createElement("button", {
    className: "mr-1 rounded bg-black px-4 py-2 text-white active:bg-white active:text-black",
    onClick: () => handleShowCards(player)
  }, "Show Cards"), /* @__PURE__ */ React.createElement("button", {
    className: "mr-1 rounded bg-black px-4 py-2 text-white active:bg-white active:text-black",
    onClick: handleMuckCards
  }, "Muck"))) : null) : null))));
}

// route:C:\Users\jreis\Desktop\Sites\poker-world\app\routes\login.tsx
var login_exports = {};
__export(login_exports, {
  action: () => action2,
  default: () => LoginPage,
  loader: () => loader4,
  meta: () => meta3
});
var import_node5 = require("@remix-run/node"), import_react9 = require("@remix-run/react"), React2 = __toESM(require("react"));

// app/utils.ts
var import_react7 = require("@remix-run/react"), import_react8 = require("react"), DEFAULT_REDIRECT = "/";
function safeRedirect(to, defaultRedirect = DEFAULT_REDIRECT) {
  return !to || typeof to != "string" || !to.startsWith("/") || to.startsWith("//") ? defaultRedirect : to;
}
function useMatchesData(id) {
  let matchingRoutes = (0, import_react7.useMatches)(), route = (0, import_react8.useMemo)(() => matchingRoutes.find((route2) => route2.id === id), [matchingRoutes, id]);
  return route == null ? void 0 : route.data;
}
function isUser(user) {
  return user && typeof user == "object" && typeof user.email == "string";
}
function useOptionalUser() {
  let data = useMatchesData("root");
  if (!(!data || !isUser(data.user)))
    return data.user;
}
function useUser() {
  let maybeUser = useOptionalUser();
  if (!maybeUser)
    throw new Error("No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.");
  return maybeUser;
}
function validateEmail(email) {
  return typeof email == "string" && email.length > 3 && email.includes("@");
}

// route:C:\Users\jreis\Desktop\Sites\poker-world\app\routes\login.tsx
async function loader4({ request }) {
  return await getUserId(request) ? (0, import_node5.redirect)("/") : (0, import_node5.json)({});
}
async function action2({ request }) {
  let formData = await request.formData(), email = formData.get("email"), password = formData.get("password"), redirectTo = safeRedirect(formData.get("redirectTo"), "/notes"), remember = formData.get("remember");
  if (!validateEmail(email))
    return (0, import_node5.json)({ errors: { email: "Email is invalid", password: null } }, { status: 400 });
  if (typeof password != "string" || password.length === 0)
    return (0, import_node5.json)({ errors: { email: null, password: "Password is required" } }, { status: 400 });
  if (password.length < 8)
    return (0, import_node5.json)({ errors: { email: null, password: "Password is too short" } }, { status: 400 });
  let user = await verifyLogin(email, password);
  return user ? createUserSession({
    request,
    userId: user.id,
    remember: remember === "on",
    redirectTo
  }) : (0, import_node5.json)({ errors: { email: "Invalid email or password", password: null } }, { status: 400 });
}
var meta3 = () => ({
  title: "Login"
});
function LoginPage() {
  var _a, _b, _c, _d;
  let [searchParams] = (0, import_react9.useSearchParams)(), redirectTo = searchParams.get("redirectTo") || "/notes", actionData = (0, import_react9.useActionData)(), emailRef = React2.useRef(null), passwordRef = React2.useRef(null);
  return React2.useEffect(() => {
    var _a2, _b2, _c2, _d2;
    ((_a2 = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _a2.email) ? (_b2 = emailRef.current) == null || _b2.focus() : ((_c2 = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _c2.password) && ((_d2 = passwordRef.current) == null || _d2.focus());
  }, [actionData]), /* @__PURE__ */ React2.createElement("div", {
    className: "flex min-h-full flex-col justify-center"
  }, /* @__PURE__ */ React2.createElement("div", {
    className: "mx-auto w-full max-w-md px-8"
  }, /* @__PURE__ */ React2.createElement(import_react9.Form, {
    method: "post",
    className: "space-y-6"
  }, /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement("label", {
    htmlFor: "email",
    className: "block text-sm font-medium text-gray-700"
  }, "Email address"), /* @__PURE__ */ React2.createElement("div", {
    className: "mt-1"
  }, /* @__PURE__ */ React2.createElement("input", {
    ref: emailRef,
    id: "email",
    required: !0,
    autoFocus: !0,
    name: "email",
    type: "email",
    autoComplete: "email",
    "aria-invalid": ((_a = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _a.email) ? !0 : void 0,
    "aria-describedby": "email-error",
    className: "w-full rounded border border-gray-500 px-2 py-1 text-lg"
  }), ((_b = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _b.email) && /* @__PURE__ */ React2.createElement("div", {
    className: "pt-1 text-red-700",
    id: "email-error"
  }, actionData.errors.email))), /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement("label", {
    htmlFor: "password",
    className: "block text-sm font-medium text-gray-700"
  }, "Password"), /* @__PURE__ */ React2.createElement("div", {
    className: "mt-1"
  }, /* @__PURE__ */ React2.createElement("input", {
    id: "password",
    ref: passwordRef,
    name: "password",
    type: "password",
    autoComplete: "current-password",
    "aria-invalid": ((_c = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _c.password) ? !0 : void 0,
    "aria-describedby": "password-error",
    className: "w-full rounded border border-gray-500 px-2 py-1 text-lg"
  }), ((_d = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _d.password) && /* @__PURE__ */ React2.createElement("div", {
    className: "pt-1 text-red-700",
    id: "password-error"
  }, actionData.errors.password))), /* @__PURE__ */ React2.createElement("input", {
    type: "hidden",
    name: "redirectTo",
    value: redirectTo
  }), /* @__PURE__ */ React2.createElement("button", {
    type: "submit",
    className: "w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
  }, "Log in"), /* @__PURE__ */ React2.createElement("div", {
    className: "flex items-center justify-between"
  }, /* @__PURE__ */ React2.createElement("div", {
    className: "flex items-center"
  }, /* @__PURE__ */ React2.createElement("input", {
    id: "remember",
    name: "remember",
    type: "checkbox",
    className: "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
  }), /* @__PURE__ */ React2.createElement("label", {
    htmlFor: "remember",
    className: "ml-2 block text-sm text-gray-900"
  }, "Remember me")), /* @__PURE__ */ React2.createElement("div", {
    className: "text-center text-sm text-gray-500"
  }, "Don't have an account?", " ", /* @__PURE__ */ React2.createElement(import_react9.Link, {
    className: "text-blue-500 underline",
    to: {
      pathname: "/join",
      search: searchParams.toString()
    }
  }, "Sign up"))))));
}

// route:C:\Users\jreis\Desktop\Sites\poker-world\app\routes\notes.tsx
var notes_exports = {};
__export(notes_exports, {
  default: () => NotesPage,
  loader: () => loader5
});
var import_node6 = require("@remix-run/node"), import_react10 = require("@remix-run/react");

// app/models/note.server.ts
function getNote({
  id,
  userId
}) {
  return prisma.note.findFirst({
    select: { id: !0, body: !0, title: !0 },
    where: { id, userId }
  });
}
function getNoteListItems({ userId }) {
  return prisma.note.findMany({
    where: { userId },
    select: { id: !0, title: !0 },
    orderBy: { updatedAt: "desc" }
  });
}
function createNote({
  body,
  title,
  userId
}) {
  return prisma.note.create({
    data: {
      title,
      body,
      user: {
        connect: {
          id: userId
        }
      }
    }
  });
}
function deleteNote({
  id,
  userId
}) {
  return prisma.note.deleteMany({
    where: { id, userId }
  });
}

// route:C:\Users\jreis\Desktop\Sites\poker-world\app\routes\notes.tsx
async function loader5({ request }) {
  let userId = await requireUserId(request), noteListItems = await getNoteListItems({ userId });
  return (0, import_node6.json)({ noteListItems });
}
function NotesPage() {
  let data = (0, import_react10.useLoaderData)(), user = useUser();
  return /* @__PURE__ */ React.createElement("div", {
    className: "flex h-full min-h-screen flex-col"
  }, /* @__PURE__ */ React.createElement("header", {
    className: "flex items-center justify-between bg-slate-800 p-4 text-white"
  }, /* @__PURE__ */ React.createElement("h1", {
    className: "text-3xl font-bold"
  }, /* @__PURE__ */ React.createElement(import_react10.Link, {
    to: "."
  }, "Notes")), /* @__PURE__ */ React.createElement("p", null, user.email), /* @__PURE__ */ React.createElement(import_react10.Form, {
    action: "/logout",
    method: "post"
  }, /* @__PURE__ */ React.createElement("button", {
    type: "submit",
    className: "rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
  }, "Logout"))), /* @__PURE__ */ React.createElement("main", {
    className: "flex h-full bg-white"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "h-full w-80 border-r bg-gray-50"
  }, /* @__PURE__ */ React.createElement(import_react10.Link, {
    to: "new",
    className: "block p-4 text-xl text-blue-500"
  }, "+ New Note"), /* @__PURE__ */ React.createElement("hr", null), data.noteListItems.length === 0 ? /* @__PURE__ */ React.createElement("p", {
    className: "p-4"
  }, "No notes yet") : /* @__PURE__ */ React.createElement("ol", null, data.noteListItems.map((note) => /* @__PURE__ */ React.createElement("li", {
    key: note.id
  }, /* @__PURE__ */ React.createElement(import_react10.NavLink, {
    className: ({ isActive }) => `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`,
    to: note.id
  }, "\u{1F4DD} ", note.title))))), /* @__PURE__ */ React.createElement("div", {
    className: "flex-1 p-6"
  }, /* @__PURE__ */ React.createElement(import_react10.Outlet, null))));
}

// route:C:\Users\jreis\Desktop\Sites\poker-world\app\routes\notes\$noteId.tsx
var noteId_exports = {};
__export(noteId_exports, {
  CatchBoundary: () => CatchBoundary,
  ErrorBoundary: () => ErrorBoundary,
  action: () => action3,
  default: () => NoteDetailsPage,
  loader: () => loader6
});
var import_node7 = require("@remix-run/node"), import_react11 = require("@remix-run/react"), import_tiny_invariant2 = __toESM(require("tiny-invariant"));
async function loader6({ request, params }) {
  let userId = await requireUserId(request);
  (0, import_tiny_invariant2.default)(params.noteId, "noteId not found");
  let note = await getNote({ userId, id: params.noteId });
  if (!note)
    throw new Response("Not Found", { status: 404 });
  return (0, import_node7.json)({ note });
}
async function action3({ request, params }) {
  let userId = await requireUserId(request);
  return (0, import_tiny_invariant2.default)(params.noteId, "noteId not found"), await deleteNote({ userId, id: params.noteId }), (0, import_node7.redirect)("/notes");
}
function NoteDetailsPage() {
  let data = (0, import_react11.useLoaderData)();
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", {
    className: "text-2xl font-bold"
  }, data.note.title), /* @__PURE__ */ React.createElement("p", {
    className: "py-6"
  }, data.note.body), /* @__PURE__ */ React.createElement("hr", {
    className: "my-4"
  }), /* @__PURE__ */ React.createElement(import_react11.Form, {
    method: "post"
  }, /* @__PURE__ */ React.createElement("button", {
    type: "submit",
    className: "rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
  }, "Delete")));
}
function ErrorBoundary({ error }) {
  return console.error(error), /* @__PURE__ */ React.createElement("div", null, "An unexpected error occurred: ", error.message);
}
function CatchBoundary() {
  let caught = (0, import_react11.useCatch)();
  if (caught.status === 404)
    return /* @__PURE__ */ React.createElement("div", null, "Note not found");
  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

// route:C:\Users\jreis\Desktop\Sites\poker-world\app\routes\notes\index.tsx
var notes_exports2 = {};
__export(notes_exports2, {
  default: () => NoteIndexPage
});
var import_react12 = require("@remix-run/react");
function NoteIndexPage() {
  return /* @__PURE__ */ React.createElement("p", null, "No note selected. Select a note on the left, or", " ", /* @__PURE__ */ React.createElement(import_react12.Link, {
    to: "new",
    className: "text-blue-500 underline"
  }, "create a new note."));
}

// route:C:\Users\jreis\Desktop\Sites\poker-world\app\routes\notes\new.tsx
var new_exports = {};
__export(new_exports, {
  action: () => action4,
  default: () => NewNotePage
});
var import_node8 = require("@remix-run/node"), import_react13 = require("@remix-run/react"), React3 = __toESM(require("react"));
async function action4({ request }) {
  let userId = await requireUserId(request), formData = await request.formData(), title = formData.get("title"), body = formData.get("body");
  if (typeof title != "string" || title.length === 0)
    return (0, import_node8.json)({ errors: { title: "Title is required", body: null } }, { status: 400 });
  if (typeof body != "string" || body.length === 0)
    return (0, import_node8.json)({ errors: { title: null, body: "Body is required" } }, { status: 400 });
  let note = await createNote({ title, body, userId });
  return (0, import_node8.redirect)(`/notes/${note.id}`);
}
function NewNotePage() {
  var _a, _b, _c, _d, _e, _f;
  let actionData = (0, import_react13.useActionData)(), titleRef = React3.useRef(null), bodyRef = React3.useRef(null);
  return React3.useEffect(() => {
    var _a2, _b2, _c2, _d2;
    ((_a2 = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _a2.title) ? (_b2 = titleRef.current) == null || _b2.focus() : ((_c2 = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _c2.body) && ((_d2 = bodyRef.current) == null || _d2.focus());
  }, [actionData]), /* @__PURE__ */ React3.createElement(import_react13.Form, {
    method: "post",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      width: "100%"
    }
  }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", {
    className: "flex w-full flex-col gap-1"
  }, /* @__PURE__ */ React3.createElement("span", null, "Title: "), /* @__PURE__ */ React3.createElement("input", {
    ref: titleRef,
    name: "title",
    className: "flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose",
    "aria-invalid": ((_a = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _a.title) ? !0 : void 0,
    "aria-errormessage": ((_b = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _b.title) ? "title-error" : void 0
  })), ((_c = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _c.title) && /* @__PURE__ */ React3.createElement("div", {
    className: "pt-1 text-red-700",
    id: "title-error"
  }, actionData.errors.title)), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", {
    className: "flex w-full flex-col gap-1"
  }, /* @__PURE__ */ React3.createElement("span", null, "Body: "), /* @__PURE__ */ React3.createElement("textarea", {
    ref: bodyRef,
    name: "body",
    rows: 8,
    className: "w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6",
    "aria-invalid": ((_d = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _d.body) ? !0 : void 0,
    "aria-errormessage": ((_e = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _e.body) ? "body-error" : void 0
  })), ((_f = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _f.body) && /* @__PURE__ */ React3.createElement("div", {
    className: "pt-1 text-red-700",
    id: "body-error"
  }, actionData.errors.body)), /* @__PURE__ */ React3.createElement("div", {
    className: "text-right"
  }, /* @__PURE__ */ React3.createElement("button", {
    type: "submit",
    className: "rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
  }, "Save")));
}

// route:C:\Users\jreis\Desktop\Sites\poker-world\app\routes\join.tsx
var join_exports = {};
__export(join_exports, {
  action: () => action5,
  default: () => Join,
  loader: () => loader7,
  meta: () => meta4
});
var import_node9 = require("@remix-run/node"), import_react14 = require("@remix-run/react"), React4 = __toESM(require("react"));
async function loader7({ request }) {
  return await getUserId(request) ? (0, import_node9.redirect)("/") : (0, import_node9.json)({});
}
async function action5({ request }) {
  let formData = await request.formData(), email = formData.get("email"), password = formData.get("password"), redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  if (!validateEmail(email))
    return (0, import_node9.json)({ errors: { email: "Email is invalid", password: null } }, { status: 400 });
  if (typeof password != "string" || password.length === 0)
    return (0, import_node9.json)({ errors: { email: null, password: "Password is required" } }, { status: 400 });
  if (password.length < 8)
    return (0, import_node9.json)({ errors: { email: null, password: "Password is too short" } }, { status: 400 });
  if (await getUserByEmail(email))
    return (0, import_node9.json)({
      errors: {
        email: "A user already exists with this email",
        password: null
      }
    }, { status: 400 });
  let user = await createUser(email, password);
  return createUserSession({
    request,
    userId: user.id,
    remember: !1,
    redirectTo
  });
}
var meta4 = () => ({
  title: "Sign Up"
});
function Join() {
  var _a, _b, _c, _d;
  let [searchParams] = (0, import_react14.useSearchParams)(), redirectTo = searchParams.get("redirectTo") ?? void 0, actionData = (0, import_react14.useActionData)(), emailRef = React4.useRef(null), passwordRef = React4.useRef(null);
  return React4.useEffect(() => {
    var _a2, _b2, _c2, _d2;
    ((_a2 = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _a2.email) ? (_b2 = emailRef.current) == null || _b2.focus() : ((_c2 = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _c2.password) && ((_d2 = passwordRef.current) == null || _d2.focus());
  }, [actionData]), /* @__PURE__ */ React4.createElement("div", {
    className: "flex min-h-full flex-col justify-center"
  }, /* @__PURE__ */ React4.createElement("div", {
    className: "mx-auto w-full max-w-md px-8"
  }, /* @__PURE__ */ React4.createElement(import_react14.Form, {
    method: "post",
    className: "space-y-6"
  }, /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("label", {
    htmlFor: "email",
    className: "block text-sm font-medium text-gray-700"
  }, "Email address"), /* @__PURE__ */ React4.createElement("div", {
    className: "mt-1"
  }, /* @__PURE__ */ React4.createElement("input", {
    ref: emailRef,
    id: "email",
    required: !0,
    autoFocus: !0,
    name: "email",
    type: "email",
    autoComplete: "email",
    "aria-invalid": ((_a = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _a.email) ? !0 : void 0,
    "aria-describedby": "email-error",
    className: "w-full rounded border border-gray-500 px-2 py-1 text-lg"
  }), ((_b = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _b.email) && /* @__PURE__ */ React4.createElement("div", {
    className: "pt-1 text-red-700",
    id: "email-error"
  }, actionData.errors.email))), /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("label", {
    htmlFor: "password",
    className: "block text-sm font-medium text-gray-700"
  }, "Password"), /* @__PURE__ */ React4.createElement("div", {
    className: "mt-1"
  }, /* @__PURE__ */ React4.createElement("input", {
    id: "password",
    ref: passwordRef,
    name: "password",
    type: "password",
    autoComplete: "new-password",
    "aria-invalid": ((_c = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _c.password) ? !0 : void 0,
    "aria-describedby": "password-error",
    className: "w-full rounded border border-gray-500 px-2 py-1 text-lg"
  }), ((_d = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _d.password) && /* @__PURE__ */ React4.createElement("div", {
    className: "pt-1 text-red-700",
    id: "password-error"
  }, actionData.errors.password))), /* @__PURE__ */ React4.createElement("input", {
    type: "hidden",
    name: "redirectTo",
    value: redirectTo
  }), /* @__PURE__ */ React4.createElement("button", {
    type: "submit",
    className: "w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
  }, "Create Account"), /* @__PURE__ */ React4.createElement("div", {
    className: "flex items-center justify-center"
  }, /* @__PURE__ */ React4.createElement("div", {
    className: "text-center text-sm text-gray-500"
  }, "Already have an account?", " ", /* @__PURE__ */ React4.createElement(import_react14.Link, {
    className: "text-blue-500 underline",
    to: {
      pathname: "/login",
      search: searchParams.toString()
    }
  }, "Log in"))))));
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { version: "3e243ca8", entry: { module: "/build/entry.client-MQASNF5I.js", imports: ["/build/_shared/chunk-ITJF5MQW.js", "/build/_shared/chunk-KQ4UEIY5.js", "/build/_shared/chunk-ZI4FXXR7.js", "/build/_shared/chunk-Z6I63RXN.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-M2IDL62A.js", imports: ["/build/_shared/chunk-WYXNEOQY.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/healthcheck": { id: "routes/healthcheck", parentId: "root", path: "healthcheck", index: void 0, caseSensitive: void 0, module: "/build/routes/healthcheck-A2VKZMUZ.js", imports: void 0, hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/index": { id: "routes/index", parentId: "root", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/index-7RM3SOZL.js", imports: void 0, hasAction: !1, hasLoader: !1, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/join": { id: "routes/join", parentId: "root", path: "join", index: void 0, caseSensitive: void 0, module: "/build/routes/join-ZOGVMCL2.js", imports: ["/build/_shared/chunk-UQFGA6YH.js", "/build/_shared/chunk-QVZVKMCD.js", "/build/_shared/chunk-7A34JLFB.js"], hasAction: !0, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/login": { id: "routes/login", parentId: "root", path: "login", index: void 0, caseSensitive: void 0, module: "/build/routes/login-6DRHFCUS.js", imports: ["/build/_shared/chunk-UQFGA6YH.js", "/build/_shared/chunk-QVZVKMCD.js", "/build/_shared/chunk-7A34JLFB.js"], hasAction: !0, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/logout": { id: "routes/logout", parentId: "root", path: "logout", index: void 0, caseSensitive: void 0, module: "/build/routes/logout-IKXGI3QT.js", imports: void 0, hasAction: !0, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/notes": { id: "routes/notes", parentId: "root", path: "notes", index: void 0, caseSensitive: void 0, module: "/build/routes/notes-KYH5O3PB.js", imports: ["/build/_shared/chunk-QVZVKMCD.js", "/build/_shared/chunk-J4EG7P3T.js", "/build/_shared/chunk-7A34JLFB.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/notes/$noteId": { id: "routes/notes/$noteId", parentId: "routes/notes", path: ":noteId", index: void 0, caseSensitive: void 0, module: "/build/routes/notes/$noteId-Y7RVFTKU.js", imports: void 0, hasAction: !0, hasLoader: !0, hasCatchBoundary: !0, hasErrorBoundary: !0 }, "routes/notes/index": { id: "routes/notes/index", parentId: "routes/notes", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/notes/index-VUI6DN3B.js", imports: void 0, hasAction: !1, hasLoader: !1, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/notes/new": { id: "routes/notes/new", parentId: "routes/notes", path: "new", index: void 0, caseSensitive: void 0, module: "/build/routes/notes/new-XSI6HG3D.js", imports: void 0, hasAction: !0, hasLoader: !1, hasCatchBoundary: !1, hasErrorBoundary: !1 } }, url: "/build/manifest-3E243CA8.js" };

// server-entry-module:@remix-run/dev/server-build
var assetsBuildDirectory = "public\\build", publicPath = "/build/", entry = { module: entry_server_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/healthcheck": {
    id: "routes/healthcheck",
    parentId: "root",
    path: "healthcheck",
    index: void 0,
    caseSensitive: void 0,
    module: healthcheck_exports
  },
  "routes/logout": {
    id: "routes/logout",
    parentId: "root",
    path: "logout",
    index: void 0,
    caseSensitive: void 0,
    module: logout_exports
  },
  "routes/index": {
    id: "routes/index",
    parentId: "root",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: routes_exports
  },
  "routes/login": {
    id: "routes/login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: login_exports
  },
  "routes/notes": {
    id: "routes/notes",
    parentId: "root",
    path: "notes",
    index: void 0,
    caseSensitive: void 0,
    module: notes_exports
  },
  "routes/notes/$noteId": {
    id: "routes/notes/$noteId",
    parentId: "routes/notes",
    path: ":noteId",
    index: void 0,
    caseSensitive: void 0,
    module: noteId_exports
  },
  "routes/notes/index": {
    id: "routes/notes/index",
    parentId: "routes/notes",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: notes_exports2
  },
  "routes/notes/new": {
    id: "routes/notes/new",
    parentId: "routes/notes",
    path: "new",
    index: void 0,
    caseSensitive: void 0,
    module: new_exports
  },
  "routes/join": {
    id: "routes/join",
    parentId: "root",
    path: "join",
    index: void 0,
    caseSensitive: void 0,
    module: join_exports
  }
};
module.exports = __toCommonJS(stdin_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  assets,
  assetsBuildDirectory,
  entry,
  publicPath,
  routes
});
