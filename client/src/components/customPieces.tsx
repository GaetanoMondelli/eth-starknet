/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  Avatar,
  Button,
  Popover,
  Select,
  Space,
  InputNumber,
  Tag,
} from "antd";
import { boardNotationToFen } from "../utils";

const pieces = [
  "wP",
  "wN",
  "wB",
  "wR",
  "wQ",
  "wK",
  "bP",
  "bN",
  "bB",
  "bR",
  "bQ",
  "bK",
];

const customPieces = (
  selectIcon: any,
  selectedPiece: any,
  selectToRide: any,
  setSelectedToRide: any,
  tokens: any,
  client: any,
  account: any,
  nftIds: any,
  balances: any,
  fetchCells: any,
  isGameStarted: any,
  whiteBalance: any,
  blackBalance: any,
  setQuantityToDeposit: any,
  quantityToDeposit: any,
  messageApi: any
) => {
  const returnPieces: any = {};
  pieces.map((p) => {
    returnPieces[p] = ({ squareWidth, sourceSquare }: any) => (
      <Popover
        trigger="click"
        title={"Wrapping " + selectedPiece + " "}
        onOpenChange={() => {
          setSelectedToRide("");
          setQuantityToDeposit(0);
        }}
        content={
          <>
            <Card
              style={{ width: 350 }}
              extra={[
                !isGameStarted && (
                  <Space>
                    <Avatar
                      size={50}
                      src={`http://localhost:5173/${selectToRide}.png`}
                    />
                    <Select
                      style={{ width: 170 }}
                      placeholder="NFT 2 ride the piece"
                      onChange={(value: any) => {
                        console.log("value", value);
                        console.log(
                          "selectedPiece",
                          `http://localhost:5173/${selectToRide}.png`
                        );
                        setSelectedToRide(value);
                      }}
                      options={
                        (() =>
                          // selectedPiece.includes("w")
                          selectedPiece > 32
                            ? tokens?.erc721?.white
                            : tokens?.erc721?.black)().map(
                          (item: any, index: any) => {
                            //  do ellipsis on token_address
                            // const address =
                            //   token.token_address.slice(0, 2) +
                            //   "..." +
                            //   token.token_address.slice(-2);
                            const token = item.node;
                            return {
                              label:
                                // "Bored Ape Chess" +
                                // token.collection.name +
                                "Token ID:" +
                                selectedPiece +
                                // address +
                                token.nftId,
                              // index of token in array select
                              value: Number(token.nftId).toString(),
                            };
                          }
                        ) || []
                      }
                    ></Select>
                    <Button
                      disabled={false}
                      onClick={async () => {
                        console.log("ride", {
                          fenPos: selectedPiece,
                          nftRideId: Number(selectToRide),
                        });
                        const result = await client.actions.ride_piece({
                          account,
                          fenPos: selectedPiece,
                          nftRideId: Number(selectToRide),
                        });
                        await messageApi.open({
                          type: "success",
                          content: `Piece ridden by NFT successfully, transaction hash: ${result.transaction_hash}`,
                          duration: 2,
                        });
                        // reload the web page
                        window.location.reload();
                        
                      }}
                    >
                      Ride
                    </Button>
                  </Space>
                ),
                !isGameStarted && (
                  <Space style={{ marginTop: "13px", marginBottom: "13px" }}>
                    <InputNumber
                      disabled={Number(balances[selectedPiece]) !== 0}
                      max={
                        selectedPiece > 32
                          ? Number(whiteBalance)
                          : Number(blackBalance)
                      }
                      onChange={(value) => {
                        setQuantityToDeposit(value);
                      }}
                      min={1}
                      defaultValue={0}
                    ></InputNumber>
                    <Button
                      disabled={false}
                      onClick={async () => {
                        console.log(
                          "deposit",
                          account,
                          selectedPiece,
                          quantityToDeposit
                        );
                        const result = await client.actions.assign_tokens({
                          account,
                          fenPos: selectedPiece,
                          tokenQuantity: quantityToDeposit,
                        });
                        await messageApi.open({
                          type: "success",
                          content: `Tokens deposited successfully, transaction hash: ${result.transaction_hash}`,
                          duration: 2,
                        });
                        // reload the web page
                        window.location.reload();
                        console.log("result", result);
                      }}
                    >
                      Deposit Tokens
                    </Button>
                  </Space>
                ),
              ]}
            >
              <Card.Meta
                avatar={
                  <Avatar
                    size={80}
                    src={`http://localhost:5173/${Number(
                      nftIds[selectedPiece]
                    )}.png`}
                  />
                }
                description={
                  <>
                    {Number(balances[selectedPiece]) === 0 ? (
                      "No tokens deposited"
                    ) : (
                      <>
                        <b>Token balance:</b>{" "}
                        <Tag style={{ fontSize: "1.3em" }} color="green">
                          {Number(balances[selectedPiece])}
                        </Tag>
                      </>
                    )}
                    <br />

                    {Number(nftIds[selectedPiece]) === 0 ? (
                      "No NFT"
                    ) : (
                      <>
                        <b> NFTId</b> <Tag>{Number(nftIds[selectedPiece])}</Tag>
                      </>
                    )}
                  </>
                }
                // description="This is the degenchess piece you want your NFT to ride"
              />
            </Card>
          </>
        }
      >
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            backgroundImage: `url(/${p}.png)`,
            backgroundSize: "100%",
            // make it 80% transparent
            opacity: 0.7,
          }}
        >
          {/* <Avatar
            style={{
              marginRight: "50%",
            }}
            // src={`http://localhost:5173/${Number(nftIds[boardNotationToFen[p]])}.png`}
            shape="square"
          >{sourceSquare? sourceSquare[0]: 'nn'}</Avatar> */}
        </div>
      </Popover>
    );
    return null;
  });
  return returnPieces;
};

export default customPieces;
