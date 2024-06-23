

# DEGEN ZK CHESS 


The chess game project is implemented using “dojoengine” in Cairo, with key components detailed in board.cairo and action.cairo files. The front-end builds upon the boot-camp repository showcased during the [Starthack video presentation for dojo engine](https://www.youtube.com/watch?v=xKYqFMibIB0&t=47s) and connects the Cairo contracts deployed to both local and publicly available Katana and torii instances, utilizing the slot NPC API (https://api.cartridge.gg/x/degenchess/katana). 

There are two main Cairo contracts, the `board.cairo` and the `actions.cairo`. The `board.cairo` contains all the required models.
The Board model represents a game state, with vairable telling what are the players addresses, which turn is (a boolean, false for white and true for black), if the game has started (is_started) which means that the player have already assigned their tokens to the pieces or if it has finished and who is the winner.
The chessboard is modeled as a list of `Cell` entities, where each cell’s value represents a chess piece using FEN notatio. The value field is a `Type` enum where each item is a piece according to the FEN notation, e.g. PAWN (capital letter for white) and bishop (lower cases for balck pieces for example the black bishop. These rerepsentatioon makle it easier to get the FEN string that can be used as input for chess engines and rendering libraries like chess.js and react-chessboard.


The `actions.cairo` contracts is responsbile of checking and updating the states of the models. The `spawn` method initialises the chessboard, allocate mock NFTs and tokens to the two players (black and white), and check the game state—verifying if it has started, if tokens have been assigned to pieces, and if the game has concluded with a winner. The `ride_nft` and`assign_tokens` actions can only be called if the chess game has not started and it ensures that the tokens belong to the calling player, checking balances, and confirming the correct piece color for assigning tokens.

The `start_game` is called after assigning tokens and allow the chess game to start.
The `move_piece` can only be called after the game has started and checks it the the calling player turn and enforce traditional chess rules, such as a bishop moving diagonally or a knight in an L-shape. Additionally, if a piece with tokens is captured, the assigned tokens are instantly transferred to the capturing player.
Finally it also checks if the captured piece is the king and in that case assign 10.000 tokens to the winner, gives back the non captured nfts and set the game to finished.


Happy coding!

# SLOT DEPLOYING

🎉 Successfully migrated World on block #3 at address 0xb4079627ebab1cd3cf9fd075dda1ad2454a7a448bf659591f259efa2519b18


--

katana --disable-fee --allowed-origins "*"
sozo build
sozo migrate apply
sh default_auth.sh
torii  --world 0xb4079627ebab1cd3cf9fd075dda1ad2454a7a448bf659591f259efa2519b18 --allowed-origins "*"

npm run dev

slot deployments create DEGENCHESS katana
---
DEGENCHESS katana
Deployment success 🚀

Endpoints:
  RPC: https://api.cartridge.gg/x/degenchess/katana
---

- CHANGE THE RPC_URL TO CONNECT TO https://api.cartridge.gg/x/degenchess/katana instead of "http://localhost:5050/"
[tool.dojo.env]
rpc_url = ["YOUR_NEW_RPC_URL"](https://api.cartridge.gg/x/degenchess/katana)


# USEFUL STATE QUERIES

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
}


{
  cellModels(where: { fenPosGTE: "0", fenPosLTE: "63" }, first: 64) {
    edges {
      node {
        fenPos
        value
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