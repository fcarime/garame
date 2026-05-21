import { useState, useEffect } from "react";
import Hand from "./Hand";
import Card from "./Card";
import PokerTable from "./PokerTable";
import CardBack from "./CardBack";
import { getAvatarStyle, DEFAULT_AVATARS } from "./avatars";
import { BG_ACCENT } from "./backgrounds";
import backgroundUrl from "./public/barckground.png";
import fondTableUrl from "./public/fond_table.png";
import {
  createDeck,
  dealCards,
  canPlayCard,
  getWinner,
  getAIMove,
  isHandEmpty,
  sortHand,
  checkSpecialWin,
} from "./gameLogic";

const INITIAL_POT = 1000;

export default function GameBoard({ gameMode, onBackToHome, socket = null, myIndex = 0, roomCode = null, playerAvatars = [DEFAULT_AVATARS.player1, DEFAULT_AVATARS.player2], localPseudo = "", remotePseudo = null, initialBankroll = 100000 }) {
  const [bgIndex] = useState(() => Math.floor(Math.random() * 12));
  const accent = BG_ACCENT[bgIndex];
  const [gameState, setGameState] = useState("setup");
  const [players] = useState(() => {
    const getName = (idx) => {
      if (gameMode === "online") {
        return idx === myIndex ? (localPseudo || `Joueur ${idx + 1}`) : (remotePseudo || `Joueur ${idx === 0 ? 1 : 2}`);
      }
      if (gameMode === "ia") return idx === 0 ? (localPseudo || "Joueur 1") : "IA";
      return idx === 0 ? "Joueur 1" : "Joueur 2";
    };
    return [
      { id: 0, name: getName(0), isAI: false },
      { id: 1, name: getName(1), isAI: gameMode === "ia" },
    ];
  });
  const [myBankroll, setMyBankroll] = useState(initialBankroll);
  const [playedCards, setPlayedCards] = useState([]);
  const [hands, setHands] = useState([[], []]);
  const [pot, setPot] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [currentRound, setCurrentRound] = useState(1);
  const [trick, setTrick] = useState([]);
  const [leadSuit, setLeadSuit] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [roundStarter, setRoundStarter] = useState(0);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [validCards, setValidCards] = useState([]);
  const [pendingOpponentCard, setPendingOpponentCard] = useState(null);
  const [specialWinInfo, setSpecialWinInfo] = useState(null);
  const [roundWinInfo, setRoundWinInfo] = useState(null); // { winner, hasBonusWin, lastCard }

  const startRound = () => {
    if (gameMode === "online" && myIndex !== 0) return;

    const deck = createDeck();
    const { hands: dealt } = dealCards(deck, 2, 5);
    const newHands = [sortHand(dealt[0]), sortHand(dealt[1])];
    const newPot = INITIAL_POT * 2;

    setHands(newHands);
    setPot(newPot);
    setTrick([]);
    setLeadSuit(null);
    setPlayedCards([]);
    setCurrentPlayer(roundStarter);
    setGameOver(false);
    setRoundWinInfo(null);

    const sw = checkSpecialWin(newHands, roundStarter);
    if (sw) {
      setGameState("specialWin");
      setSpecialWinInfo({ ...sw, hands: newHands, potValue: newPot });
      setMessage(`${players[sw.player].name} a une main spéciale!`);
      if (gameMode === "online" && socket) {
        socket.emit("specialWin", { roomCode, sw, hands: newHands, roundStarter, scores, currentRound, potValue: newPot });
      }
      return;
    }

    setGameState("playing");
    setMessage(`${players[roundStarter].name} commence`);

    if (gameMode === "online" && socket) {
      socket.emit("startRound", { roomCode, hands: newHands, roundStarter, scores, currentRound });
    }
  };

  useEffect(() => {
    if (gameState === "setup") {
      startRound();
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === "nextRound") {
      startRound();
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === "playing" && trick.length < 2) {
      let displayPlayer;
      if (gameMode === "online") {
        // En online, surligner les cartes seulement quand c'est mon tour
        if (currentPlayer !== myIndex) { setValidCards([]); return; }
        displayPlayer = myIndex;
      } else {
        displayPlayer = 0;
      }
      const playableCards = hands[displayPlayer].filter(card =>
        canPlayCard(card, leadSuit, hands[displayPlayer])
      );
      setValidCards(playableCards);
    }
  }, [currentPlayer, leadSuit, gameState, hands, trick, gameMode, myIndex]);

  // Écoute des événements socket en mode online
  useEffect(() => {
    if (gameMode !== "online" || !socket) return;

    socket.on("roundStarted", ({ hands: newHands, roundStarter: rs, scores: syncedScores, currentRound: syncedRound }) => {
      setHands([sortHand(newHands[0]), sortHand(newHands[1])]);
      setPot(INITIAL_POT * 2);
      setTrick([]);
      setLeadSuit(null);
      setPlayedCards([]);
      setCurrentPlayer(rs);
      setRoundStarter(rs);
      // Resync depuis l'hôte (corrige les désyncs après victoire spéciale)
      if (Array.isArray(syncedScores) && syncedScores.length === 2) {
        setScores(syncedScores);
      }
      if (typeof syncedRound === "number") {
        setCurrentRound(syncedRound);
      }
      setGameState("playing");
      setMessage(`${players[rs].name} commence`);
      setGameOver(false);
      setRoundWinInfo(null);
    });

    socket.on("specialWinNotified", ({ sw, hands: newHands, roundStarter: rs, scores: syncedScores, currentRound: syncedRound, potValue }) => {
      setHands([sortHand(newHands[0]), sortHand(newHands[1])]);
      setPot(potValue);
      setTrick([]);
      setLeadSuit(null);
      setPlayedCards([]);
      setCurrentPlayer(rs);
      setRoundStarter(rs);
      if (Array.isArray(syncedScores)) setScores(syncedScores);
      if (typeof syncedRound === "number") setCurrentRound(syncedRound);
      setGameOver(false);
      setRoundWinInfo(null);
      setGameState("specialWin");
      setSpecialWinInfo({ ...sw, hands: newHands, potValue });
      setMessage(`${players[sw.player].name} a une main spéciale!`);
    });

    socket.on("cardPlayed", ({ card, playerIdx }) => {
      setPendingOpponentCard({ card, playerIdx });
    });

    socket.on("opponentDisconnected", () => {
      setMessage("L'adversaire s'est déconnecté!");
      setGameOver(true);
    });

    socket.on("bankrollUpdated", (bankrolls) => {
      const myName = players[myIndex].name;
      if (typeof bankrolls[myName] === "number") setMyBankroll(bankrolls[myName]);
    });

    socket.on("gameRestarted", () => {
      setScores([0, 0]);
      setCurrentRound(1);
      setRoundStarter(0);
      setGameOver(false);
      setHands([[], []]);
      setTrick([]);
      setLeadSuit(null);
      setPlayedCards([]);
      setMessage("");
      setGameState("setup");
    });

    // Le distant a cliqué REJOUER → l'hôte relance la partie
    socket.on("restartRequested", () => {
      if (myIndex !== 0) return;
      setScores([0, 0]);
      setCurrentRound(1);
      setRoundStarter(0);
      setGameOver(false);
      setHands([[], []]);
      setTrick([]);
      setLeadSuit(null);
      setPlayedCards([]);
      setMessage("");
      socket.emit("restartGame", { roomCode });
      setGameState("setup");
    });

    return () => {
      socket.off("roundStarted");
      socket.off("specialWinNotified");
      socket.off("cardPlayed");
      socket.off("opponentDisconnected");
      socket.off("bankrollUpdated");
      socket.off("gameRestarted");
      socket.off("restartRequested");
    };
  }, [gameMode, socket]);

  // Traitement du coup reçu de l'adversaire (via pendingOpponentCard)
  useEffect(() => {
    if (!pendingOpponentCard || gameState !== "playing") return;
    const { card, playerIdx } = pendingOpponentCard;
    const cardIndex = hands[playerIdx].findIndex(
      c => c.suit === card.suit && c.value === card.value
    );
    setPendingOpponentCard(null);
    if (cardIndex !== -1) playCardLogic(playerIdx, cardIndex);
  }, [pendingOpponentCard, gameState]);

  // Auto-dismiss spécial win après 4s (ou clic)
  useEffect(() => {
    if (gameState !== "specialWin" || !specialWinInfo) return;
    const sw = specialWinInfo;
    const timer = setTimeout(() => {
      setSpecialWinInfo(null);
      endRound(sw.player);
    }, 4000);
    return () => clearTimeout(timer);
  }, [gameState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss du round win overlay (court pour ne pas bloquer la manche suivante)
  useEffect(() => {
    if (!roundWinInfo) return;
    const timer = setTimeout(() => {
      setRoundWinInfo(null);
    }, roundWinInfo.hasBonusWin ? 2800 : 1600);
    return () => clearTimeout(timer);
  }, [roundWinInfo]);

  useEffect(() => {
    if (gameState === "playing" && currentPlayer === 1 && trick.length < 2 && gameMode === "ia") {
      const timer = setTimeout(() => {
        const playable = hands[1].filter(card =>
          canPlayCard(card, leadSuit, hands[1])
        );
        if (playable.length > 0) {
          const aiCard = getAIMove(hands[1], leadSuit, trick);
          playCardLogic(1, hands[1].indexOf(aiCard));
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameState, hands, trick, leadSuit, gameMode]);

  const playCardLogic = (playerIdx, cardIndex) => {
    const card = hands[playerIdx][cardIndex];

    if (!canPlayCard(card, leadSuit, hands[playerIdx])) {
      setMessage("Coup invalide! Suivez la couleur.");
      return;
    }

    const newHands = [...hands];
    newHands[playerIdx] = newHands[playerIdx].filter((_, i) => i !== cardIndex);
    setHands(newHands);

    setPlayedCards(prev => [...prev, { player: playerIdx, card }]);

    const newTrick = [...trick, { player: playerIdx, card }];
    setTrick(newTrick);

    if (newTrick.length === 1) {
      setLeadSuit(card.suit);
      setMessage(`${players[playerIdx].name} joue ${card.value}${card.suit}`);
      setCurrentPlayer(1 - playerIdx);
    } else {
      const demandedSuit = newTrick[0].card.suit;
      const winner = getWinner(newTrick, demandedSuit);
      setMessage(`${players[winner.player].name} gagne le pli!`);
      setGameState("trickEnd");

      setTimeout(() => {
        if (isHandEmpty(newHands[0]) && isHandEmpty(newHands[1])) {
          endRound(winner.player, winner.card);
        } else {
          setTrick([]);
          setLeadSuit(null);
          setCurrentPlayer(winner.player);
          setGameState("playing");
        }
      }, 900);
    }
  };

  const playCard = (index) => {
    if (gameState !== "playing") return;
    if (gameMode === "ia" && currentPlayer !== 0) return;
    if (gameMode === "online" && currentPlayer !== myIndex) return;

    if (gameMode === "online" && socket) {
      const card = hands[myIndex][index];
      socket.emit("playCard", { roomCode, card, playerIdx: myIndex });
    }

    playCardLogic(currentPlayer, index);
  };

  const endRound = (winner, lastCard = null) => {
    const hasBonusWin = lastCard?.value === "3";

    setGameState("roundEnd");

    const newScores = [...scores];
    newScores[winner] += 1; // +1 manche gagnée
    if (hasBonusWin) newScores[winner] += 1; // manche bonus automatique
    setScores(newScores);

    if (hasBonusWin) {
      setMessage(`${players[winner].name} gagne + manche bonus (dernier 3)!`);
    } else {
      setMessage(`${players[winner].name} gagne la manche!`);
    }

    const isFinalWin = newScores[winner] >= 3;

    // Overlay festif (sauf pour les wins spéciaux déjà annoncés par leur propre modal)
    if (lastCard) {
      setRoundWinInfo({ winner, hasBonusWin, lastCard });
    }

    if (isFinalWin) {
      setMessage(`${players[winner].name} remporte la partie et les 2 000 FCFA!`);
      if (gameMode === "online" && socket && myIndex === 0) {
        socket.emit("gameResult", {
          roomCode,
          winnerPseudo: players[winner].name,
          loserPseudo: players[1 - winner].name,
        });
      }
      // Délai pour laisser l'overlay de fin de manche / CORRA s'afficher avant le modal Game Over
      const delay = lastCard ? (hasBonusWin ? 2800 : 1600) : 0;
      setTimeout(() => setGameOver(true), delay);
    } else {
      setTimeout(() => {
        setCurrentRound(prev => prev + (hasBonusWin ? 2 : 1));
        if (!hasBonusWin) setRoundStarter(prev => 1 - prev);
        setGameState("nextRound");
      }, hasBonusWin ? 4500 : 3000);
    }
  };

  const restartGame = () => {
    // En online, si je suis le distant : demander à l'hôte de relancer.
    // Sinon l'hôte ne le saurait pas et le distant resterait bloqué en "setup".
    if (gameMode === "online" && socket && myIndex !== 0) {
      setScores([0, 0]);
      setCurrentRound(1);
      setRoundStarter(0);
      setGameOver(false);
      setHands([[], []]);
      setTrick([]);
      setLeadSuit(null);
      setPlayedCards([]);
      setMessage("En attente du redémarrage de l'hôte…");
      setWaitingForPlayer(null);
      setGameState("setup");
      socket.emit("requestRestart", { roomCode });
      return;
    }

    setScores([0, 0]);
    setCurrentRound(1);
    setRoundStarter(0);
    setGameState("setup");
    setMessage("");
    if (gameMode === "online" && socket && myIndex === 0) {
      socket.emit("restartGame", { roomCode });
    }
  };

  if (gameState === "setup" && hands[0].length === 0) {
    return null;
  }

  const myDisplayName = gameMode === "online"
    ? players[myIndex].name
    : (localPseudo || "Vous");

  const myScore = gameMode === "online" ? scores[myIndex] : scores[0];

  const myTurn = gameMode === "online"
    ? currentPlayer === myIndex
    : currentPlayer === 0;

  const myCards = gameMode === "online" ? hands[myIndex] : hands[0];

  const myHandLabel = gameMode === "online" ? `J${myIndex + 1}` : "VOUS";

  const myAvatarId = playerAvatars[myIndex];

  const opponentIndex = gameMode === "online" ? 1 - myIndex : 1;

  const opponentAvatarId = players[opponentIndex].isAI
    ? DEFAULT_AVATARS.ai
    : playerAvatars[opponentIndex];

  return (
    <div className="gameboard-root" style={{
      width: "100%",
      height: "100vh",
      backgroundImage: `url(${backgroundUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundColor: "#0a0a1f",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
    }}>
      <style>{`
        @media (max-width: 600px) {
          .gameboard-root {
            background-image: url(${fondTableUrl}) !important;
            background-size: cover !important;
            background-position: center !important;
          }
          .poker-table-bg { display: none !important; }
          .gameboard-header { padding-top: 18px !important; }
        }
      `}</style>

      {/* ── Header compact ── */}
      <div className="gameboard-header" style={{
        position: "relative", zIndex: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "90px 14px 6px",
        flexShrink: 0,
      }}>
        <button
          onClick={() => {
            if (gameMode === "online" && socket) {
              socket.emit("leaveRoom", { roomCode });
            }
            onBackToHome();
          }}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "rgba(255,255,255,0.4)",
            fontSize: "10px", fontWeight: "700",
            padding: "4px 10px", letterSpacing: "1px", cursor: "pointer",
          }}
        >
          ← MENU
        </button>

        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "16px", fontWeight: "900", letterSpacing: "5px",
            color: accent,
            textShadow: `0 0 16px ${accent}99`,
          }}>
            GARAME
          </div>
          <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.25)", letterSpacing: "2px", marginTop: "1px" }}>
            MANCHE {currentRound} · {gameMode === "online" ? `EN LIGNE J${myIndex + 1}` : "VS IA"}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.25)", letterSpacing: "1px" }}>MANCHES</div>
          <div style={{ fontSize: "12px", fontWeight: "900", color: accent }}>
            {scores[0]}/3 <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span> {scores[1]}/3
          </div>
        </div>
      </div>


      {/* ── ADVERSAIRE (au-dessus du plateau, cartes chevauchent le bord haut) ── */}
      {(() => {
        const opponentActive = currentPlayer === opponentIndex;
        return (
          <div style={{
            position: "relative", zIndex: 10,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            padding: "0 12px",
            marginBottom: "clamp(-20px, -4.5vw, -32px)",
          }}>
            {/* Grand portrait de fond — centré sur le bord haut du plateau */}
            <div style={{
              position: "absolute",
              bottom: "clamp(-70px, -18vw, -138px)", left: "50%",
              transform: "translateX(-50%)",
              ...getAvatarStyle(opponentAvatarId, 160),
              width: "min(38vw, 160px)",
              height: "min(38vw, 160px)",
              opacity: opponentActive ? 0.65 : 0.38,
              zIndex: -1,
              pointerEvents: "none",
              filter: opponentActive
                ? "drop-shadow(0 0 18px rgba(0,217,255,0.55))"
                : "drop-shadow(0 0 8px rgba(0,0,0,0.8))",
              transition: "opacity 0.4s ease, filter 0.4s ease",
            }} />

            {/* Info bar adversaire */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(4,18,46,0.85)",
              border: opponentActive ? "1px solid rgba(0,217,255,0.7)" : "1px solid rgba(255,255,255,0.12)",
              borderRadius: "20px",
              padding: "5px 12px 5px 7px",
              boxShadow: opponentActive ? "0 0 14px rgba(0,217,255,0.4)" : "none",
              backdropFilter: "blur(6px)",
              transition: "all 0.3s ease",
            }}>
              <div style={{
                ...getAvatarStyle(opponentAvatarId, 32),
                width: "clamp(24px, 6.5vw, 32px)",
                height: "clamp(24px, 6.5vw, 32px)",
                border: opponentActive ? "2px solid #00D9FF" : "2px solid rgba(255,255,255,0.2)",
                boxShadow: opponentActive ? "0 0 10px rgba(0,217,255,0.5)" : "none",
              }} />
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#fff", letterSpacing: "0.5px" }}>
                  {players[opponentIndex].name}
                </div>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#4ade80" }}>
                  {scores[opponentIndex]}<span style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)", marginLeft: "2px" }}>/3</span>
                </div>
              </div>
              {opponentActive && (
                <div style={{
                  width: "7px", height: "7px", borderRadius: "50%",
                  background: "#00D9FF", boxShadow: "0 0 8px #00D9FF",
                  marginLeft: "4px", flexShrink: 0,
                }} />
              )}
            </div>

            {/* Dos de cartes en éventail — chevauchent le bord haut du plateau */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "4px",
              padding: "4px 0 0",
              minHeight: "68px",
            }}>
              {hands[opponentIndex].length === 0 ? (
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", alignSelf: "center" }}>—</div>
              ) : (() => {
                const total = hands[opponentIndex].length;
                const mid = (total - 1) / 2;
                return hands[opponentIndex].map((_, i) => {
                  const rotation = (i - mid) * 2.5;
                  const lift = Math.pow(i - mid, 2) * 1.5;
                  return (
                    <div key={i} style={{
                      transform: `rotate(${rotation}deg) translateY(${lift}px)`,
                      transformOrigin: "50% -80%",
                      zIndex: i + 1,
                    }}>
                      <CardBack small />
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        );
      })()}

      {/* ── TABLE (zone principale) ── */}
      <div style={{ flex: 1, position: "relative", zIndex: 1, minHeight: 0 }}>
        <PokerTable
          trick={trick}
          playedCards={playedCards}
          leadSuit={leadSuit}
          pot={pot}
          message={message}
          myTurn={myTurn}
          gameOver={gameOver}
        />
      </div>

      {/* ── ZONE JOUEUR (bas de l'écran, cartes chevauchent le bord bas) ── */}
      <div style={{
        position: "relative", zIndex: 10,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        padding: "0 12px 24px",
        marginTop: "clamp(-20px, -4.5vw, -32px)",
      }}>
        {/* Grand portrait de fond — centré sur le bord bas du plateau */}
        <div style={{
          position: "absolute",
          top: "clamp(-50px, -13vw, -85px)", left: "50%",
          transform: "translateX(-50%)",
          ...getAvatarStyle(myAvatarId, 175),
          width: "min(42vw, 175px)",
          height: "min(42vw, 175px)",
          opacity: myTurn ? 0.65 : 0.38,
          zIndex: -1,
          pointerEvents: "none",
          filter: myTurn
            ? "drop-shadow(0 0 18px rgba(0,217,255,0.55))"
            : "drop-shadow(0 0 8px rgba(0,0,0,0.8))",
          transition: "opacity 0.4s ease, filter 0.4s ease",
        }} />

        {/* Cartes en premier — chevauchent le bord bas du plateau */}
        <Hand
          cards={myCards}
          onPlay={playCard}
          validCards={validCards}
          playerName={myHandLabel}
        />

        {/* Barre infos joueur */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(4,18,46,0.85)",
          border: myTurn ? "1px solid rgba(0,217,255,0.6)" : "1px solid rgba(255,255,255,0.1)",
          borderRadius: "22px",
          padding: "5px 14px 5px 8px",
          backdropFilter: "blur(10px)",
          boxShadow: myTurn ? "0 0 16px rgba(0,217,255,0.3)" : "none",
          transition: "all 0.3s ease",
        }}>
          <div style={{
            ...getAvatarStyle(myAvatarId, 34),
            width: "clamp(26px, 7vw, 34px)",
            height: "clamp(26px, 7vw, 34px)",
            border: myTurn ? "2px solid #00D9FF" : "2px solid rgba(255,255,255,0.15)",
            boxShadow: myTurn ? "0 0 10px rgba(0,217,255,0.5)" : "none",
          }} />
          <div>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#fff", letterSpacing: "0.5px" }}>
              {myDisplayName}
            </div>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "#4ade80" }}>
              {myScore}<span style={{ fontSize: "8px", color: "rgba(255,255,255,0.35)", marginLeft: "2px" }}>/3</span>
            </div>
            {gameMode === "online" && (
              <div style={{ fontSize: "9px", color: "#F59E0B", fontWeight: "700", marginTop: "1px" }}>
                {myBankroll.toLocaleString("fr-FR")} FCFA
              </div>
            )}
          </div>
          {myTurn && (
            <div style={{
              width: "7px", height: "7px", borderRadius: "50%",
              background: "#00D9FF", boxShadow: "0 0 8px #00D9FF",
              marginLeft: "4px", flexShrink: 0,
            }} />
          )}
        </div>
      </div>

      {/* ── Special Win Overlay ── */}
      {specialWinInfo && (
        <div
          onClick={() => {
            const sw = specialWinInfo;
            setSpecialWinInfo(null);
            endRound(sw.player);
          }}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(9,14,27,0.95)",
            backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1200, cursor: "pointer",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#1E293B",
              padding: "28px 36px",
              borderRadius: "20px",
              textAlign: "center",
              maxWidth: "400px",
              width: "90vw",
              border: `1px solid ${specialWinInfo.reason === "triple7" ? "rgba(251,191,36,0.55)" : "rgba(0,217,255,0.45)"}`,
              boxShadow: `0 0 60px ${specialWinInfo.reason === "triple7" ? "rgba(251,191,36,0.18)" : "rgba(0,217,255,0.12)"}, 0 40px 80px rgba(0,0,0,0.6)`,
              animation: "slideUp 0.35s ease",
            }}
          >
            {/* Badge raison */}
            <div style={{
              display: "inline-block",
              fontSize: "11px", fontWeight: "800", letterSpacing: "3px",
              textTransform: "uppercase",
              color: specialWinInfo.reason === "triple7" ? "#FCD34D" : "#00D9FF",
              background: specialWinInfo.reason === "triple7" ? "rgba(251,191,36,0.12)" : "rgba(0,217,255,0.1)",
              border: `1px solid ${specialWinInfo.reason === "triple7" ? "rgba(251,191,36,0.3)" : "rgba(0,217,255,0.3)"}`,
              borderRadius: "20px", padding: "4px 16px", marginBottom: "16px",
            }}>
              {specialWinInfo.reason === "triple7" ? "⚡ TRIPLE SEPT" : `🃏 MAIN BASSE · ${specialWinInfo.sum} pts`}
            </div>

            {/* Nom du gagnant */}
            <div style={{ fontSize: "22px", fontWeight: "900", color: "#fff", marginBottom: "4px" }}>
              {players[specialWinInfo.player].name}
            </div>
            <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "20px" }}>
              GAGNE LA MANCHE
            </div>

            {/* Cartes révélées */}
            <div style={{
              display: "flex", justifyContent: "center", gap: "8px",
              marginBottom: "20px", padding: "14px 10px",
              background: "rgba(15,23,42,0.6)", borderRadius: "12px",
            }}>
              {specialWinInfo.hands[specialWinInfo.player].map((card, i) => {
                const isKey = specialWinInfo.reason === "triple7" && card.value === "7";
                return (
                  <div key={i} style={{
                    transform: isKey ? "translateY(-12px) scale(1.08)" : "none",
                    boxShadow: isKey ? "0 0 22px rgba(251,191,36,0.75)" : "none",
                    outline: isKey ? "2px solid #FCD34D" : "none",
                    outlineOffset: "3px",
                    borderRadius: "8px",
                    transition: "transform 0.3s ease",
                  }}>
                    <Card value={card.value} suit={card.suit} />
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.22)", letterSpacing: "1px" }}>
              Appuyez pour continuer · auto dans 4s
            </div>
          </div>
        </div>
      )}

      {/* ── Round Win Overlay (CORRA pour 3, festif sinon) ── */}
      {roundWinInfo && !gameOver && (() => {
        const { winner, hasBonusWin, lastCard } = roundWinInfo;
        const isCorra = hasBonusWin;
        const accentColor = isCorra ? "#FCD34D" : "#00D9FF";
        const accentGlow = isCorra ? "rgba(251,191,36,0.55)" : "rgba(0,217,255,0.45)";
        return (
          <div
            style={{
              position: "fixed", inset: 0,
              background: isCorra ? "rgba(20,8,2,0.55)" : "rgba(9,14,27,0.45)",
              backdropFilter: "blur(3px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 1100,
              animation: "fadeIn 0.25s ease",
              // Non-bloquant : la manche suivante peut commencer sans gêne
              pointerEvents: "none",
            }}
          >
            {/* Particules dorées pour la CORRA */}
            {isCorra && (
              <>
                {[...Array(18)].map((_, i) => {
                  const angle = (i * 360) / 18;
                  const color = i % 2 === 0 ? "#FCD34D" : "#F59E0B";
                  return (
                    <div key={i} style={{
                      position: "absolute",
                      left: "50%", top: "50%",
                      width: "10px", height: "10px",
                      borderRadius: "50%",
                      background: color,
                      boxShadow: `0 0 12px ${color}`,
                      animation: `sparkleBurst 1.6s ease-out ${i * 0.04}s both`,
                      "--rot": `${angle}deg`,
                      pointerEvents: "none",
                    }} />
                  );
                })}
              </>
            )}

            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: "relative",
                textAlign: "center",
                padding: "32px 40px",
                animation: isCorra ? "corraPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" : "slideUp 0.35s ease",
              }}
            >
              {isCorra ? (
                <>
                  {/* Halo derrière */}
                  <div style={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "320px", height: "320px",
                    background: "radial-gradient(circle, rgba(251,191,36,0.35) 0%, transparent 65%)",
                    pointerEvents: "none",
                    animation: "haloPulse 1.6s ease-in-out infinite",
                  }} />

                  {/* CORRA ! */}
                  <div style={{
                    position: "relative",
                    fontSize: "clamp(56px, 16vw, 96px)",
                    fontWeight: "900",
                    letterSpacing: "8px",
                    background: "linear-gradient(180deg, #FEF3C7 0%, #FCD34D 45%, #F59E0B 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textShadow: `0 0 40px ${accentGlow}`,
                    filter: "drop-shadow(0 4px 16px rgba(245,158,11,0.6))",
                    lineHeight: 1,
                    marginBottom: "4px",
                  }}>
                    CORRA&nbsp;!
                  </div>

                  {/* Carte 3 mise en avant */}
                  <div style={{
                    position: "relative",
                    display: "inline-block",
                    margin: "18px 0 14px",
                    animation: "cardSpin 0.9s ease-out",
                    filter: "drop-shadow(0 0 24px rgba(251,191,36,0.85))",
                  }}>
                    <Card value={lastCard.value} suit={lastCard.suit} />
                  </div>

                  <div style={{
                    fontSize: "13px",
                    fontWeight: "800",
                    letterSpacing: "4px",
                    color: "#FEF3C7",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}>
                    + Manche bonus
                  </div>
                  <div style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#fff",
                    letterSpacing: "1px",
                  }}>
                    {players[winner].name}
                  </div>
                </>
              ) : (
                <>
                  {/* Halo discret */}
                  <div style={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "260px", height: "260px",
                    background: `radial-gradient(circle, ${accentGlow} 0%, transparent 65%)`,
                    pointerEvents: "none",
                    animation: "haloPulse 1.6s ease-in-out infinite",
                  }} />

                  <div style={{
                    position: "relative",
                    fontSize: "11px",
                    fontWeight: "800",
                    letterSpacing: "5px",
                    color: accentColor,
                    textTransform: "uppercase",
                    marginBottom: "10px",
                    opacity: 0.85,
                  }}>
                    Manche gagnée
                  </div>
                  <div style={{
                    position: "relative",
                    fontSize: "clamp(34px, 8vw, 52px)",
                    fontWeight: "900",
                    color: "#fff",
                    letterSpacing: "1px",
                    textShadow: `0 0 30px ${accentGlow}`,
                    lineHeight: 1.1,
                    marginBottom: "8px",
                  }}>
                    {players[winner].name}
                  </div>
                  <div style={{
                    position: "relative",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: accentColor,
                    letterSpacing: "2px",
                  }}>
                    +1 / 3
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Game Over Modal ── */}
      {gameOver && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(9,14,27,0.92)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          animation: "fadeIn 0.3s ease",
        }}>
          <div style={{
            background: "#1E293B",
            padding: "40px 48px",
            borderRadius: "20px",
            textAlign: "center",
            maxWidth: "440px",
            width: "90vw",
            border: "1px solid rgba(0,217,255,0.3)",
            boxShadow: "0 0 0 1px rgba(0,217,255,0.1), 0 0 60px rgba(0,217,255,0.15), 0 40px 80px rgba(0,0,0,0.6)",
            animation: "slideUp 0.35s ease",
          }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#64748B", letterSpacing: "3px", marginBottom: "16px" }}>
              PARTIE TERMINÉE
            </div>

            <div style={{
              fontSize: "40px", fontWeight: "900", letterSpacing: "-1px", lineHeight: 1, marginBottom: "8px",
              color: scores[myIndex] >= scores[opponentIndex] ? "#00D9FF" : "#EF4444",
              textShadow: `0 0 30px ${scores[myIndex] >= scores[opponentIndex] ? "rgba(0,217,255,0.5)" : "rgba(239,68,68,0.5)"}`,
            }}>
              {scores[myIndex] >= scores[opponentIndex] ? "VICTOIRE" : "DÉFAITE"}
            </div>

            <div style={{
              fontSize: "13px", color: "#94A3B8", marginBottom: "8px", fontStyle: "italic",
            }}>
              {scores[myIndex] > scores[opponentIndex] ? "Vous remportez" : "L'adversaire remporte"}
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{
                fontSize: "28px", fontWeight: "900", color: "#F59E0B",
                textShadow: "0 0 20px rgba(245,158,11,0.5)",
              }}>
                {scores[myIndex] >= scores[opponentIndex] ? "+2 000" : "-2 000"} FCFA
              </div>
              {gameMode === "online" && (
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "4px" }}>
                  Bankroll : <span style={{ color: "#F59E0B", fontWeight: "700" }}>{myBankroll.toLocaleString("fr-FR")} FCFA</span>
                </div>
              )}
            </div>

            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "24px",
              marginBottom: "32px",
              padding: "16px 24px",
              background: "rgba(15,23,42,0.6)",
              borderRadius: "12px",
              border: "1px solid rgba(100,116,139,0.2)",
            }}>
              {[0, 1].map(i => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" }}>
                    {players[i].name}
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "900", color: i === 0 ? "#00D9FF" : "#F59E0B" }}>
                    {scores[i]}
                  </div>
                  <div style={{ fontSize: "9px", color: "#334155" }}>MANCHE{scores[i] > 1 ? "S" : ""}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={restartGame}
                style={{
                  padding: "13px 28px",
                  fontSize: "13px",
                  fontWeight: "700",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  background: "#00D9FF",
                  color: "#0F172A",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  boxShadow: "0 0 20px rgba(0,217,255,0.4)",
                }}
              >
                REJOUER
              </button>
              <button
                onClick={() => {
                  if (gameMode === "online" && socket) {
                    socket.emit("leaveRoom", { roomCode });
                  }
                  onBackToHome();
                }}
                style={{
                  padding: "13px 28px",
                  fontSize: "13px",
                  fontWeight: "700",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  background: "transparent",
                  color: "#64748B",
                  border: "1px solid rgba(100,116,139,0.4)",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                ACCUEIL
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.6;
            transform: translateX(-50%) scale(1.2);
          }
        }
        @keyframes corraPop {
          0%   { opacity: 0; transform: scale(0.4) rotate(-8deg); }
          60%  { opacity: 1; transform: scale(1.1) rotate(2deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes cardSpin {
          0%   { transform: rotateY(0deg) scale(0.7); }
          50%  { transform: rotateY(180deg) scale(1.15); }
          100% { transform: rotateY(360deg) scale(1); }
        }
        @keyframes haloPulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 1;   transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes sparkleBurst {
          0%   { opacity: 0; transform: rotate(var(--rot, 0deg)) translateY(0px) scale(0.4); }
          30%  { opacity: 1; }
          100% { opacity: 0; transform: rotate(var(--rot, 0deg)) translateY(-260px) scale(0.2); }
        }
      `}</style>
    </div>
  );
}
