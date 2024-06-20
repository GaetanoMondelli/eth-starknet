import { Card, Avatar, Button, Popover, Select, Space } from "antd";
import { useState } from "react";

// const [selectIcon, setSelectedIcon] = useState<string>("");
// const [selectedPiece, setSelectedPiece] = useState<string>("");

// const [hasGameStatarted, setHasGameStarted] = useState<boolean>(true);

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
    selectIcon: unknown,
    selectedPiece: unknown,
    selectToRide: unknown,
    setSelectedToRide: unknown,
) => {
  const returnPieces: any = {};
  pieces.map((p) => {
    returnPieces[p] = ({ squareWidth }: any) => (
      <Popover
        trigger="click"
        title={"Wrapping " + selectedPiece}
        content={
          <>
            <Card
              style={{ width: 350 }}
              extra={
                <>
                  <Space>
                    <Avatar
                      src={
                        selectToRide !== undefined
                          ? "https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2021%2F10%2Fbored-ape-yacht-club-nft-3-4-million-record-sothebys-metaverse-1.jpg?q=90&w=1400&cbr=1&fit=max"
                          : `http://localhost:3000/${selectIcon}.png`
                      }
                    />
                    <Select
                      style={{ width: 170 }}
                      placeholder="NFT 2 ride the piece"
                      onChange={(value: any) => {
                        console.log("value", value);
                        setSelectedToRide(value);
                      }}
                      options={
                        tokenBalance?.map((token: any, index: any) => {
                          //  do ellipsis on token_address
                          let address =
                            token.token_address.slice(0, 2) +
                            "..." +
                            token.token_address.slice(-2);
                          return {
                            label:
                              "Bored Ape Chess" +
                              // token.collection.name +
                              "- " +
                              address +
                              " - " +
                              token.token_id,
                            // index of token in array select
                            value: index,
                          };
                        }) || []
                      }
                    ></Select>
                    <Button
                      disabled={false}
                      onClick={async () => {
                        //   const { address } = await link.setup({});
                        //   try {
                        //     const transferResponsePayload = await link.transfer(
                        //       [
                        //         {
                        //           type: ERC721TokenType.ERC721,
                        //           tokenId: '1',
                        //           tokenAddress:
                        //             '0xd314b8e99cadf438a00c7975a92b89ddb524aa65',
                        //           toAddress:
                        //             '0x3783c988e6436f966B0B19AA948a566d7361bd3d',
                        //         },
                        //       ],
                        //     );
                        //     // Print the result
                        //     console.log(transferResponsePayload);
                        //   } catch (error) {
                        //     // Catch and print out the error
                        //     console.error(error);
                        //   }
                        // console.log('wrap', selectedPiece, response);
                      }}
                    >
                      Ride {selectedPiece}
                    </Button>
                  </Space>
                </>
              }
            >
              <Card.Meta
                avatar={
                  <Avatar src={`http://localhost:3000/${selectIcon}.png`} />
                }
                description="This is the degenchess piece you want your NFT to ride"
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
          }}
        />
      </Popover>
    );
    return null;
  });
  return returnPieces;
};

export default customPieces;