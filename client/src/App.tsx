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
import { boardNotation, chessboardNotation } from "./utils";
import { Card, Collapse, Descriptions, List, message, Tag } from "antd";
// sha256
import sha256 from "sha256";
import Confetti from "react-confetti";

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

const queryTokens = `
{
  erc721Models(
    first: 10,
    where: { id: "1" }
  ) {
    edges {
      node {
        id
        owner
        nftId
        ownerType
      }
    }
  }
  erc20Models(
    where: { id: "1" } 
  ) {
    edges {
      node {
        id
        owner
        ownerType
        balance
      }
    }
  }
}
`;

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
  const [selectedPiece, setSelectedPiece] = useState<any>("");
  const [selectToRide, setSelectToRide] = useState<string>();
  const [positions, setPositions] = useState(boardNotation);
  const [tokenBalance, setTokenBalance] = useState<any>(null);
  const [nftIds, setNftdIds] = useState<any>([]);
  const [balances, setBalances] = useState<any>([]);
  const [customSquareStyles, setCustomSquareStyles] = useState<any>({});
  const [quantityToDeposit, setQuantityToDeposit] = useState<number>(0);
  const [messageApi, contextHolder] = message.useMessage();

  const [tokens, setTokens] = useState({
    erc20: { white: 0, black: 0 },
    erc721: { white: [], black: [] },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTokens = async () => {
    try {
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: queryTokens }),
      });
      const result = await response.json();
      console.log("FETCH-tokens", result);

      if (result.errors) {
        throw new Error(result.errors.map((e: any) => e.message).join(", "));
      }

      const erc20 = {
        white: result.data.erc20Models.edges.find(
          (edge: any) => edge.node.ownerType === "White"
        ).node.balance,
        black: result.data.erc20Models.edges.find(
          (edge: any) => edge.node.ownerType === "Black"
        ).node.balance,
      };

      const erc721 = {
        white: result.data.erc721Models.edges.filter(
          (edge: any) => edge.node.ownerType === "White"
        ),
        black: result.data.erc721Models.edges.filter(
          (edge: any) => edge.node.ownerType === "Black"
        ),
      };
      console.log("FETCH-tokens", { erc20, erc721 });

      return { erc20, erc721 };
    } catch (err: any) {
      console.error(err);
    }
  };

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

      const turn = result.data.boardModels.edges[0].node.turn;
      const is_started = result.data.boardModels.edges[0].node.is_started;

      return { turn, is_started };
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchCells: any = async () => {
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

      console.log(
        "FETCH-cells",
        result.data.cellModels.edges.sort(
          (a: { node: { fenPos: number } }, b: { node: { fenPos: number } }) =>
            a.node.fenPos - b.node.fenPos
        )
      );

      const nftIds = result.data.cellModels.edges
        .map((edge: { node: any }) => edge.node)
        .sort(
          (a: { fenPos: number }, b: { fenPos: number }) => a.fenPos - b.fenPos
        )
        .map((cell: any) => cell.nftRideId);

      const tokenQuantities = result.data.cellModels.edges
        .map((edge: { node: any }) => edge.node)
        .sort(
          (a: { fenPos: number }, b: { fenPos: number }) => a.fenPos - b.fenPos
        )
        .map((cell: any) => cell.tokenQuantity);

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
      console.log("FETCH-fenString", { fenString, nftIds, tokenQuantities });
      return { fenString, nftIds, tokenQuantities };
    } catch (err: any) {
      console.error(err);
    }
  };

  const generateCustomSquareStyles = (nftIds: any, balances: any) => {
    const customSquareStyles = {} as any;

    nftIds.forEach((nftId: any, index: any) => {
      const square = chessboardNotation[index];
      const id = Number(nftId);
      if (id !== 0) {
        customSquareStyles[square] = {
          backgroundImage: `url(http://localhost:5173/${id}.png)`,
          backgroundSize: "60%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        };
      }

      if (Number(balances[index]) > 0) {
        // console.log("balance", balances[index], index);
        if (customSquareStyles[square]) {
          customSquareStyles[square].border = "3px solid yellow";
        } else {
          customSquareStyles[square] = { border: "5px solid yellow" };
        }
      }

      console.log("customSquareStyles", customSquareStyles);
    });

    return customSquareStyles;
  };

  useEffect(() => {
    const fetchAndSetGamePos = async () => {
      const { fenString, nftIds, tokenQuantities } = await fetchCells();
      setGamePos(convertCustomFenToStandard(fenString || ""));
      console.log("fenString initial", fenString);

      setNftdIds(nftIds);
      setBalances(tokenQuantities);
      setCustomSquareStyles(
        generateCustomSquareStyles(nftIds, tokenQuantities)
      );

      const tokens = await fetchTokens();
      setTokens(tokens as any);

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
    setSelectedPiece(chessPositionToIndex(square));
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

  return (
    <div className="container mx-auto">
      {contextHolder}
      <Confetti run={game.isGameOver()} width={2600} height={2000} />
      <h1 className="text-3xl text-center">♞ Degen Zkhess ♗</h1>
      <button
        style={{
          color: "white",
          backgroundColor: "lightblue",
          padding: "3px",
          borderRadius: "5px",
          marginTop: "10px",
        }}
        onClick={async () => {
          const response = await client.actions.spawn({ account });
          messageApi.open({
            type: "success",
            content: `Spawned successfully, transaction hash: ${response.transaction_hash}`,
            duration: 6,
          });
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }}
      >
        Spawn Chessboard
      </button>
      <div className="text-xl py-3">
        {board?.id && (
          <>
            <Descriptions
              bordered
              title="Game Info"
              size={"default"}
              // extra={<Button type="primary">Edit</Button>}
              items={[
                {
                  key: "1",
                  label: "Board Id",
                  children: "1",
                },
                {
                  key: "2",
                  label: "Is Started",
                  children: board.is_started ? "Yes" : "No",
                },
                {
                  key: "3",
                  label: "Is Finished",
                  children: game.isGameOver() ? "Yes" : "No",
                },
                {
                  key: "4",
                  label: "Turn",
                  children:
                    game.turn() == "w" ? (
                      <>
                        White
                        <span
                          style={{
                            color: "black",
                            fontSize: "2em",
                            marginLeft: "5px",
                          }}
                        >
                          ♘
                        </span>
                      </>
                    ) : (
                      <>
                        Black
                        <span
                          style={{
                            color: "black",
                            fontSize: "2em",
                            marginLeft: "5px",
                          }}
                        >
                          ♛
                        </span>
                      </>
                    ),
                },
                {
                  key: "5",
                  label: "White Player",
                  children: "45c4ce9d...ae8a28ec",
                },
                {
                  key: "6",
                  label: "Black Player",
                  children: "e51b4a65...f390c229",
                },
                {
                  key: "7",
                  label: "Winner",
                  children: game.isGameOver()
                    ? game.turn() === "b"
                      ? "White"
                      : "Black"
                    : "None",
                },
              ]}
            />
            {/* <div>Board Registered</div>
            <div>Turn {game.turn()}</div>
            <div>Move {loading ? "loading" : "not loading"}</div>
            <div>Game Started {isGameStarted ? "yes" : "no"}</div>
            {/* <div>Winner {game.in_checkmate() ? game.turn() : "none"}</div> 
            <div>Selected Piece {selectedPiece}</div> */}

            <br></br>
            {!board?.is_started && (
              <button
                style={{
                  color: "white",
                  backgroundColor: "lightgreen",
                  padding: "3px",
                  borderRadius: "5px",
                  marginTop: "10px",
                }}
                onClick={async () => {
                  const response = await client.actions.start_game({ account });
                  // refresh the page
                  // wait 5 seconds
                  messageApi.open({
                    type: "success",
                    content: `Game Started successfully, transaction hash: ${response.transaction_hash}`,
                    duration: 6,
                  });
                  setTimeout(() => {
                    window.location.reload();
                  }, 3000);
                }}
              >
                Start Game
              </button>
            )}
            <br></br>
            <br></br>
          </>
        )}
        <div className="flex justify-between">
          {gamePos && (
            <div
              style={{
                // display: "flex",
                // justifyContent: "center",
                marginTop: "50px",
              }}
            >
              <Chessboard
                customBoardStyle={{
                  border: "1px solid #000",
                  margin: "0 auto",
                  borderRadius: "10px",
                }}
                arePiecesDraggable={isGameStarted}
                customSquareStyles={customSquareStyles}
                id="BasicBoard"
                boardWidth={700}
                position={
                  // loading ? "" : gamePos
                  gamePos
                }
                customPieces={customPieces(
                  selectIcon,
                  selectedPiece,
                  selectToRide,
                  setSelectToRide,
                  tokens,
                  client,
                  account,
                  nftIds,
                  balances,
                  fetchCells,
                  isGameStarted,
                  tokens.erc20.white,
                  tokens.erc20.black,
                  setQuantityToDeposit,
                  quantityToDeposit,
                  messageApi
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
                      messageApi.open({
                        type: "success",
                        content: `Piece moved successfully, transaction hash: ${res.transaction_hash}`,
                        duration: 6,
                      });
                      setLoading(true);
                      // Delay before fetching cells
                      setTimeout(async () => {
                        const { fenString, nftIds, tokenQuantities } =
                          await fetchCells();
                        console.log(
                          "fenString",
                          convertCustomFenToStandard(fenString || "")
                        );

                        setNftdIds(nftIds);
                        setBalances(tokenQuantities);
                        setCustomSquareStyles(
                          generateCustomSquareStyles(nftIds, tokenQuantities)
                        );

                        setGamePos(
                          convertCustomFenToStandard(
                            fenString || "",
                            game.turn() === "w" ? "b" : "w"
                          )
                        );

                        const tokens = await fetchTokens();
                        setTokens(tokens as any);

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
          <div
            style={{
              width: "850px",
              height: "100%",
              marginLeft: "45px",
              marginTop: "50px",
            }}
          >
            <Collapse
              items={[
                {
                  key: "1",
                  label: (
                    <p
                      style={{
                        fontSize: 22,
                      }}
                    >
                      White
                    </p>
                  ),
                  children: (
                    <div>
                      <Card
                        style={{
                          marginTop: 16,
                          fontSize: 22,
                          textAlign: "left",
                        }}
                        type="inner"
                        title="ERC20 Id: 1"
                      >
                        Name: Token 1<br></br>
                        Symbol: T1
                        <br></br>
                        Owner: <Tag color="green">45c4ce9d...ae8a28ec</Tag>
                        <br></br>
                        Balance:{" "}
                        <Tag style={{ fontSize: 20 }} color="green">
                          {Number(BigInt(tokens.erc20.white).toString()) +
                            (game.isGameOver() && game.turn() === "b"
                              ? 10000
                              : 0)}
                        </Tag>
                      </Card>
                      <h2>ERC721</h2>
                      <List
                        grid={{ gutter: 16, column: 4 }}
                        dataSource={tokens.erc721.white}
                        renderItem={(item: any) => (
                          <List.Item>
                            <Card
                              style={{
                                marginTop: 10,
                                fontSize: 20,
                                textAlign: "left",
                              }}
                              cover={
                                <img
                                  alt="example"
                                  src={`/${BigInt(item.node.nftId)}.png`}
                                  style={{ width: 250 }}
                                />
                              }
                              type="inner"
                              title={`ERC721 Id: ${item.node.id}`}
                            >
                              Collection: {item.node.id}
                              <br></br>
                              tokenId: {item.node.nftId}
                              <br></br>
                              Owner:{" "}
                              <Tag color="blue">
                                {sha256(
                                  item.node.owner + item.node.ownerType
                                ).slice(0, 8)}
                                ...
                                {sha256(
                                  item.node.owner + item.node.ownerType
                                ).slice(-8)}
                              </Tag>
                            </Card>
                          </List.Item>
                        )}
                      />
                    </div>
                  ),
                },
                {
                  key: "2",
                  label: (
                    <p
                      style={{
                        fontSize: 22,
                      }}
                    >
                      Black
                    </p>
                  ),
                  children: (
                    <div>
                      <Card
                        style={{
                          marginTop: 16,
                          fontSize: 22,
                          textAlign: "left",
                        }}
                        type="inner"
                        title="ERC20 Id: 1"
                      >
                        Name: Token 1<br></br>
                        Symbol: T1
                        <br></br>
                        Owner: <Tag color="green">e51b4a65...f390c229</Tag>
                        <br></br>
                        Balance:{" "}
                        <Tag style={{ fontSize: 20 }} color="green">
                          {Number(BigInt(tokens.erc20.black).toString()) +
                            (game.isGameOver() && game.turn() === "w"
                              ? 10000
                              : 0)}
                        </Tag>
                      </Card>
                      <h2>ERC721</h2>
                      <List
                        grid={{ gutter: 16, column: 4 }}
                        dataSource={tokens.erc721.black}
                        renderItem={(item: any) => (
                          <List.Item>
                            <Card
                              style={{
                                marginTop: 10,
                                fontSize: 20,
                                textAlign: "left",
                              }}
                              cover={
                                <img
                                  alt="example"
                                  src={`/${BigInt(item.node.nftId)}.png`}
                                  style={{ width: 200 }}
                                />
                              }
                              type="inner"
                              title={`ERC721 Id: ${item.node.id}`}
                            >
                              Collection: {item.node.id}
                              <br></br>
                              tokenId: {item.node.nftId}
                              <br></br>
                              Owner:{" "}
                              <Tag color="blue">
                                {sha256(
                                  item.node.owner + item.node.ownerType + "a"
                                ).slice(0, 8)}
                                ...
                                {sha256(
                                  item.node.owner + item.node.ownerType
                                ).slice(-8)}
                              </Tag>
                            </Card>
                          </List.Item>
                        )}
                      />
                    </div>
                  ),
                },
              ]}
              defaultActiveKey={["1"]}
            />
          </div>
        </div>
        <br></br>
        <br></br>
        <br></br>

        <br></br>

        {/* <pre>
          {JSON.stringify(tokens, null, 2)}
        </pre> */}
      </div>
    </div>
  );
}

export default App;
