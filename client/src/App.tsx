import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { useDojo } from "./dojo/useDojo";
import { useComponentValue, useEntityQuery } from "@dojoengine/react";
import { Chessboard } from "react-chessboard";
import { getEntityIdFromKeys } from "@dojoengine/utils";
// import { shortString } from "starknet";
import { Has, HasValue } from "@dojoengine/recs";
import { Chess } from "chess.js";

function convertCustomFenToStandard(customFen: string) {
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
  standardFen += " w KQkq - 0 1";

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
  // <div
  //   onClick={async () => {
  //     // await client.actions.paint({
  //     //   account,
  //     //   x,
  //     //   y,
  //     //   color: BigInt(shortString.encodeShortString(color)),
  //     // });
  //   }}
  //   // className={`w-12 cursor-pointer duration-300 hover:bg-${color}-100 h-12 border-${color}-100 border-blue-100/10 flex justify-center bg-${shortString.decodeShortString(tile.color.toString())}-100`}
  // >
  //   <span className="self-center text-black/20">{cell.value}</span>
  // </div>
  // );
}

function App() {
  const [game, setGame] = useState(new Chess());
  const [gamePos, setGamePos] = useState(game.fen());

  const {
    setup: {
      client,
      clientComponents: { Board, Cell },
    },
    account: { account },
  } = useDojo();

  // [get] player with recs query
  const playerQuery = useEntityQuery([
    Has(Board),
    HasValue(Board, { id: 1 }),
    // BigInt(account.address)
  ]);

  const board = useComponentValue(Board, playerQuery[0]);

  const fenRepr = useComponentValue(Cell, getEntityIdFromKeys([BigInt(0)]));
  let fenString = "-".repeat(64);
  for (let i = 0; i < 64; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const cell = useComponentValue(Cell, getEntityIdFromKeys([BigInt(i)]));
    fenString = fenString.slice(0, i) + cell?.value[0] + fenString.slice(i + 1);
  }

  const [fetch, setFetch] = useState(false);
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
      {/* <div className="flex gap-2 justify-center">
        <button
          className={`px-2 py-1  border border-red-500 ${color === "red" && "bg-red-100"}`}
          onClick={() => setColor("red")}
        >
          red
        </button>
        <button
          className={`px-2 py-1  border border-blue-500 ${color === "blue" && "bg-blue-100"}`}
          onClick={() => setColor("blue")}
        >
          blue
        </button>
      </div> */}
      <div className="text-xl py-3">
        {board?.id ? (
          <>
            <div>Board Registered</div>
            <button
              onClick={async () => {
                setFetch(true);
                setTimeout(() => {
                  setFetch(false);
                }, 1000);
              }}
            >
              {fetch ? "fetching" : "fetch"}
            </button>
            <pre>{JSON.stringify(board, null, 2)}</pre>
            <pre>{JSON.stringify(gamePos, null, 2)}</pre>
            <pre>
              {JSON.stringify(convertCustomFenToStandard(fenString), null, 2)}
            </pre>

            <div className="grid grid-cols-8 gap-2">
              {grid.map((cell) => (
                <div>
                  <span className="self-center text-black/20">{cell}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <button
            onClick={async () => {
              await client.actions.spawn({ account });
            }}
          >
            spawn
          </button>
        )}
      </div>
      <Chessboard
        id="BasicBoard"
        position={convertCustomFenToStandard(fenString)}
        // customPieces={customPieces()}
        onPieceDrop={(from, to) => {
          const move = game.move({
            from: from,
            to: to,
            promotion: "q",
          });

          if (move === null) return false;
          console.log("move", from, to);
          setGamePos(game.fen());
          return true;
        }}
        // onPieceClick={onPieceClick}
        // onSquareClick={onSquareClick}
        boardWidth={500}
        customDarkSquareStyle={{ backgroundColor: "#0033FF" }}
        customLightSquareStyle={{ backgroundColor: "#FF00FF" }}
      />
    </div>
  );
}

export default App;
