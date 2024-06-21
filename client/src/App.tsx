/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { useDojo } from "./dojo/useDojo";
import { useComponentValue, useEntityQuery } from "@dojoengine/react";
import { Chessboard } from "react-chessboard";
import { getEntityIdFromKeys } from "@dojoengine/utils";
// import { shortString } from "starknet";
import { Has, HasValue } from "@dojoengine/recs";
import { Chess } from "chess.js";
import customPieces from "./components/customPieces";
import { boardNotation } from "./utils";
import { set } from "mobx";

function chessPositionToIndex(pos) {
  // Extract the column (letter) and row (number)
  const column = pos.charAt(0);
  const row = pos.charAt(1);

  // Convert column letter to index (a=0, b=1, ..., h=7)
  const columnIndex = column.charCodeAt(0) - "a".charCodeAt(0);

  // Convert row number to index (1=7, 2=6, ..., 8=0)
  const rowIndex = 8 - parseInt(row);

  // Calculate the position in the array
  const index = rowIndex * 8 + columnIndex;

  return index;
}

function convertCustomFenToStandard(customFen: string, turn: string = "w") {
  // Split the custom FEN string into rows
  const rows = [];
  for (let i = 0; i < 8; i++) {
    rows.push(customFen.slice(i * 8, (i + 1) * 8));
  }
  // Function to convert a single row to standard FEN
  function convertRow(row: string) {
    let fenRow = "";
    let emptyCount = 0;
    for (let char of row) {
      if (char === "E") {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          fenRow += emptyCount;
          emptyCount = 0;
        }
        fenRow += char;
      }
    }
    if (emptyCount > 0) {
      fenRow += emptyCount;
    }
    return fenRow;
  }

  // Convert each row and join them with '/'
  const fenRows = rows.map(convertRow);
  let standardFen = fenRows.join("/");

  // Add the remaining FEN information for a starting position
  standardFen += ` ${turn} KQkq - 0 1`;

  return standardFen;
}

function CellBoard({ fenPos }: { fenPos: number }) {
  const {
    setup: {
      clientComponents: { Cell },
      client,
    },
    account: { account },
  } = useDojo();

  const cell = useComponentValue(Cell, getEntityIdFromKeys([BigInt(fenPos)]), {
    fenPos: fenPos,
    value: "-",
  });

  return cell.value;
}

const queryBoard = `
{
  boardModels(where: { idEQ: "1" }) {
    edges {
      node {
        id
        white_player
        black_player
        turn
        is_finished
        is_started
        winner
        entity {
          id
          __typename
        }
      }
      cursor
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}`;

const query = `
{
  cellModels(where: { fenPosGTE: "0", fenPosLTE: "63" }, first: 64) {
    edges {
      node {
        fenPos
        value
        nftRideId
        tokenQuantity
        entity {
          id
          __typename
        }
      }
      cursor
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
`;

function App() {
  const [game, setGame] = useState(new Chess());
  const [gamePos, setGamePos] = useState<any>("");
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [selectIcon, setSelectedIcon] = useState<string>("");
  const [selectedPiece, setSelectedPiece] = useState<string>("");
  const [selectToRide, setSelectToRide] = useState<string>();
  const [positions, setPositions] = useState(boardNotation);
  const [tokenBalance, setTokenBalance] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTurn = async () => {
    try {
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: queryBoard }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors.map((e) => e.message).join(", "));
      }

      console.log("FETCH-turn", result.data.boardModels.edges[0].node);

      const turn = result.data.boardModels.edges[0].node.turn;
      const is_started = result.data.boardModels.edges[0].node.is_started;

      return { turn, is_started };
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchCells = async () => {
    try {
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors.map((e) => e.message).join(", "));
      }

      const cells = result.data.cellModels.edges
        .map((edge: { node: any }) => edge.node)
        .sort(
          (a: { fenPos: number }, b: { fenPos: number }) => a.fenPos - b.fenPos
        )
        .map((cell: { value: any }) => cell.value);

      let fenString = "-".repeat(64);
      for (let i = 0; i < 64; i++) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        let symbol =
          cells[i].toLowerCase() === "knight" ? cells[i][1] : cells[i][0];
        fenString = fenString.slice(0, i) + symbol + fenString.slice(i + 1);
      }
      console.log("FETCH-fenString", fenString);
      return fenString;
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchAndSetGamePos = async () => {
      const fenString = await fetchCells();
      setGamePos(convertCustomFenToStandard(fenString || ""));
      console.log("fenString initial", fenString);

      const response = await fetchTurn();
      const turn = response?.turn ? "b" : "w";
      const is_started = response?.is_started;
      setIsGameStarted(is_started);
      console.log("turn", turn);

      setGame(
        new Chess(
          convertCustomFenToStandard(fenString || "", turn) ||
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        )
      );
    };

    fetchAndSetGamePos();
  }, []);

  function onPieceClick(piece: any) {
    console.log("piece shape", piece);
    setSelectedIcon(piece);
  }

  function onSquareClick(square: any) {
    console.log("square", square);
    // check key inside final object that has value of square and return the key
    let piece = Object.keys(positions).find((key) => positions[key] === square);
    console.log("piece", piece);
    setSelectedPiece(piece || "");
  }

  const {
    setup: {
      client,
      clientComponents: { Board, Cell },
    },
    account: { account },
  } = useDojo();

  // [get] player with recs query
  const playerQuery = useEntityQuery(
    [
      Has(Board),
      HasValue(Board, { id: 1 }),
      // BigInt(account.address)
    ],
    { updateOnValueChange: true }
  );

  const board = useComponentValue(Board, playerQuery[0]);
  // const fenRepr = useComponentValue(Cell, getEntityIdFromKeys([BigInt(0)]));
  // let fenString = "-".repeat(64);
  // for (let i = 0; i < 64; i++) {
  //   // eslint-disable-next-line react-hooks/rules-of-hooks
  //   const cell = useComponentValue(Cell, getEntityIdFromKeys([BigInt(i)]));
  //   fenString = fenString.slice(0, i) + cell?.value[0] + fenString.slice(i + 1);
  // }

  // const [fetch, setFetch] = useState(false);
  // useState<"red" | "blue">("red");

  const grid = useMemo(() => {
    const board = [];
    for (let col = 0; col < 64; col++) {
      board.push(<CellBoard key={`${col}`} fenPos={col} />);
    }
    return board;
  }, [fetch]);

  // console.log(Number(player?.last_action.toString()) || 0);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl text-center">Degen Zkhess</h1>
      <button
        onClick={async () => {
          await client.actions.spawn({ account });
          // refresh the page
          // wait 5 seconds
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }}
      >
        spawn
      </button>
      <div className="text-xl py-3">
        {board?.id && (
          <>
            <div>Board Registered</div>
            <div>Turn {game.turn()}</div>
            <div>Move {loading ? "loading" : "not loading"}</div>
            <div>Game Started {isGameStarted ? "yes" : "no"}</div>

            <button
              onClick={async () => {
                await client.actions.start_game({ account });
                // refresh the page
                // wait 5 seconds
                setTimeout(() => {
                  window.location.reload();
                }, 3000);
              }}
            >
              Start Game
            </button>

            <br></br>
          </>
        )}

        {gamePos && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "50px",
            }}
          >
            <Chessboard
              customBoardStyle={{
                border: "1px solid #000",
                margin: "0 auto",
                borderRadius: "10px",
              }}
              id="BasicBoard"
              boardWidth={900}
              position={
                // loading ? "" : gamePos
                gamePos
              }
              customPieces={customPieces(
                selectIcon,
                selectedPiece,
                selectToRide,
                setSelectToRide,
                tokenBalance
              )}
              onPieceDrop={(from, to) => {
                console.log("move", from, to);
                console.log(
                  "move",
                  chessPositionToIndex(from),
                  chessPositionToIndex(to)
                );

                const okay = game.move({
                  from: from,
                  to: to,
                  promotion: "q",
                });

                console.log("okay", okay.after);
                setGamePos(okay.after);

                client.actions
                  .move_piece({
                    account,
                    from: chessPositionToIndex(from),
                    to: chessPositionToIndex(to),
                  })
                  .then(async (res) => {
                    console.log("Piece moved successfully", res);
                    setLoading(true);
                    // Delay before fetching cells
                    setTimeout(async () => {
                      const fenString = await fetchCells();
                      console.log(
                        "fenString",
                        convertCustomFenToStandard(fenString || "")
                      );

                      setGamePos(
                        convertCustomFenToStandard(
                          fenString || "",
                          game.turn() === "w" ? "b" : "w"
                        )
                      );
                      setLoading(false);
                    }, 800);
                  })
                  .catch((error) => {
                    console.error("Error moving piece:", error);
                  });

                return true;
              }}
              onPieceClick={onPieceClick}
              onSquareClick={onSquareClick}
              customDarkSquareStyle={{ backgroundColor: "#0033FF" }}
              customLightSquareStyle={{ backgroundColor: "#FF00FF" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
