use dojo_starter::models::board::{Board};
use dojo_starter::models::board::{Cell};
use dojo_starter::models::board::{Type};
use dojo_starter::models::board::{ERC20};
use dojo_starter::models::board::{ERC721};
use dojo_starter::models::board::{PlayerType};




// define the interface
#[dojo::interface]
trait IActions {
    fn spawn(ref world: IWorldDispatcher);
    fn move_piece(ref world: IWorldDispatcher, from: u64, to: u64);
    fn ride_piece(ref world: IWorldDispatcher, fenPos: u64, nftRideId: u64);
    fn assign_tokens(ref world: IWorldDispatcher, fenPos: u64, tokenQuantity: u64);
    fn startGame(ref world: IWorldDispatcher);
}

// dojo decorator
#[dojo::contract]
mod actions {
    // use super::{IActions, next_position};
    use super::{IActions};
    use starknet::{ContractAddress, get_caller_address};
    use dojo_starter::models::{
        board::{Board, Cell, Type, TypeTrait, ERC20, ERC721, PlayerType},
    };

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn spawn(ref world: IWorldDispatcher) {
            // Get the address of the current caller, possibly the player's address.
            let player = get_caller_address();
            set!(
                world,
                (
                    Board { 
                        id: 1,
                        white_player: player,
                        black_player: player,
                        turn: false,
                        is_finished: false,
                        is_started: false,
                        winner: player
                    },
                )
            );


            // assign erc20 tokens to the players
            set!(
                world,
                (
                    ERC20 {
                        id: 1,
                        owner: player,
                        ownerType: PlayerType::White,
                        balance: 1000,
                    },
                )
            );

            set!(
                world,
                (
                    ERC20 {
                        id: 1,
                        owner: player,
                        ownerType: PlayerType::Black,
                        balance: 1000,
                    },
                )
            );

            // assign 5 erc721 tokens to the players

            let mut j: u64 = 1;

            loop {
                if j >= 6 { // Break condition
                    break ();
                }

                set!(
                    world,
                    (
                        ERC721 {
                            id: 1,
                            owner: player,
                            ownerType: PlayerType::White,
                            nftId: j,
                            attribute: j*10,
                        },
                    )
                );

                set!(
                    world,
                    (
                        ERC721 {
                            id: 1,
                            owner: player,
                            ownerType: PlayerType::Black,
                            nftId: j + 5,
                            attribute: j*5,
                        },
                    )
                );

                j = j + 1;
            };


            let mut i: u64 = 0;

            loop {
                if i >= 64 { // Break condition
                    break ();
                }
                
                let mut t_type = Type::Empty;

                // capital letters are white pieces
                // small letters are black pieces
                if i == 0 || i == 7  {
                    t_type = Type::rook;
                } else if i == 56 || i == 63 {
                    t_type = Type::ROOK;
                } else if i == 1 || i == 6 {
                    t_type = Type::knight;
                } else if i == 57 || i == 62 {
                    t_type = Type::KNIGHT;
                } else if i == 2 || i == 5 {
                    t_type = Type::bishop;
                } else if i == 58 || i == 61 {
                    t_type = Type::BISHOP;
                } else if i == 3 {
                    t_type = Type::queen;
                } else if i == 59 {
                    t_type = Type::QUEEN;
                } else if i == 4 {
                    t_type = Type::king;
                } else if i == 60 {
                    t_type = Type::KING;
                } else if i >= 8 && i < 16 {
                    t_type = Type::pawn;
                } else if i >= 48 && i < 56 {
                    t_type = Type::PAWN;
                }
                
                set!(
                    world,
                    (
                        Cell {
                            fenPos: i,
                            value: t_type,
                            nftRideId: 0,
                            tokenQuantity: 0,
                        },
                    )
                );
                i = i + 1;
            };
        }

        fn move_piece(ref world: IWorldDispatcher, from: u64, to: u64) {            
            let player = get_caller_address();
            let board = get!(world, 1, Board);
            if board.turn == false && player != board.white_player {
                return ();
            } else if board.turn == true && player != board.black_player {
                return ();
            }

            let mut cell_from = get!(world, from, Cell);
            let mut cell_to = get!(world, to, Cell);

            if board.is_finished {
                return ();
            }

            if board.is_started == false {
                return ();
            }

            // if cell_from.value.is_empty(){
            //     return ();
            // }

            // if board.turn == false && cell_from.value.is_white() {
            //     return ();
            // }

            // if board.turn == true && cell_from.value.is_black() {
            //     return ();
            // }

            // if to > 63 {
            //     return ();
            // }

            let toPiece = cell_to.value;

            // if cell_from.value.is_pawn() {
            //     if cell_from.value.is_white() {
            //         if (to > from) && (to - from) == 8 {
            //             cell_to.value = cell_from.value;
            //             cell_from.value = Type::Empty;
            //         } else if (to - from) == 16 && cell_from.fenPos < 16 {
            //             cell_to.value = cell_from.value;
            //             cell_from.value = Type::Empty;
            //         } else {
            //             return ();
            //         }
            //     } else {
            //         if (from > to) && (from - to) == 8 {
            //             cell_to.value = cell_from.value;
            //             cell_from.value = Type::Empty;
            //         } else if (from > to) && (from - to) == 16 && cell_from.fenPos > 47 {
            //             cell_to.value = cell_from.value;
            //             cell_from.value = Type::Empty;
            //         } else {
            //             return ();
            //         }
            //     }
            // } 

            // if cell_from.value.is_rook() {
            //     if (from / 8 == to / 8) || (from % 8 == to % 8) {
            //         cell_to.value = cell_from.value;
            //         cell_from.value = Type::Empty;
            //     } else {
            //         return ();
            //     }
            // }

            // if cell_from.value.is_bishop() {
            //     if (from > to && (from / 8 - to / 8) == (from % 8 - to % 8)) 
            //         || (from < to && (to / 8 - from / 8) == (to % 8 - from % 8)) {
            //         cell_to.value = cell_from.value;
            //         cell_from.value = Type::Empty;
            //     } else {
            //         return ();
            //     }
            // }


            // if cell_from.value.is_knight() {
            //     if (from / 8 == to / 8 + 2 && from % 8 == to % 8 + 1) 
            //         || (from / 8 == to / 8 + 2 && from % 8 == to % 8 - 1) 
            //         || (from / 8 == to / 8 - 2 && from % 8 == to % 8 + 1) 
            //         || (from / 8 == to / 8 - 2 && from % 8 == to % 8 - 1) 
            //         || (from / 8 == to / 8 + 1 && from % 8 == to % 8 + 2) 
            //         || (from / 8 == to / 8 + 1 && from % 8 == to % 8 - 2) 
            //         || (from / 8 == to / 8 - 1 && from % 8 == to % 8 + 2) 
            //         || (from / 8 == to / 8 - 1 && from % 8 == to % 8 - 2) {
            //         cell_to.value = cell_from.value;
            //         cell_from.value = Type::Empty;
            //     } else {
            //         return ();
            //     }
            // }


            // if cell_from.value.is_queen() {
            //     if (from / 8 == to / 8) || (from % 8 == to % 8) 
            //         || (from > to && (from / 8 - to / 8) == (from % 8 - to % 8)) 
            //         || (from < to && (to / 8 - from / 8) == (to % 8 - from % 8)) {
            //         cell_to.value = cell_from.value;
            //         cell_from.value = Type::Empty;
            //     } else {
            //         // !!! check the inverse diagonal works
            //         return ();
            //     }
            // }

            // if cell_from.value.is_king() {
            //     if (from / 8 == to / 8 && (from % 8 == to % 8 + 1 || from % 8 == to % 8 - 1)) 
            //         || (from % 8 == to % 8 && (from / 8 == to / 8 + 1 || from / 8 == to / 8 - 1)) 
            //         || (from > to && (from / 8 - to / 8) == (from % 8 - to % 8) && (from / 8 - to / 8 == 1 || from % 8 - to % 8 == 1)) 
            //         || (from < to && (to / 8 - from / 8) == (to % 8 - from % 8) && (to / 8 - from / 8 == 1 || to % 8 - from % 8 == 1)) {
            //         cell_to.value = cell_from.value;
            //         cell_from.value = Type::Empty;
            //     } else {
            //         return ();
            //     }
            // }



            // else {
            //     cell_to.value = cell_from.value;
            //     cell_from.value = Type::Empty;
            // }

            
            // UNCOMMENT FOR REMOVING CONSTRAINTS
            let mut nftCaptureId = cell_to.nftRideId;
            let tokenQuantity = cell_to.tokenQuantity;

            cell_to.value = cell_from.value;
            cell_from.value = Type::Empty;

            if nftCaptureId != 0 {
                let mut nft = get!(world, (1,PlayerType::Board,nftCaptureId), ERC721);
                let mut playerType = PlayerType::White;
                if board.turn == true {
                    playerType = PlayerType::Black;
                }
                nft.owner = player;
                nft.ownerType = playerType;
                set!(world, (nft));
            }

            if tokenQuantity != 0 {
                let mut playerType = PlayerType::White;
                if board.turn == true {
                    playerType = PlayerType::Black;
                }
                let mut erc20Player = get!(world, (1,player,playerType), ERC20);
                erc20Player.balance = erc20Player.balance + tokenQuantity;
                set!(world, (erc20Player));
            }

            if board.turn == false {
                set!(world, (
                    Board {
                        id: 1,
                        white_player: board.white_player,
                        black_player: board.black_player,
                        turn: true,
                        is_finished: toPiece.is_king(),
                        is_started: board.is_started,
                        winner: player,
                    },
                 cell_from, cell_to));
            } else {
                set!(world, (
                    Board {
                        id: 1,
                        white_player: board.white_player,
                        black_player: board.black_player,
                        turn: false,
                        is_finished: toPiece.is_king(),
                        is_started: board.is_started,
                        winner: player,
                    },
                 cell_from, cell_to));
            }



        }

        fn ride_piece(ref world: IWorldDispatcher, fenPos: u64, nftRideId: u64) {
            let board = get!(world, 1, Board);
            if board.is_started == true {
                return ();
            }
            if board.is_finished {
                return ();
            }
            
            let player = get_caller_address();

            // if board.white_player == player && fenPos > 16 {
            //     return ();
            // }

            // if board.black_player == player && fenPos < 47 {
            //     return ();
            // }

            let mut playerType = PlayerType::White;
            if fenPos < 32 {
                playerType = PlayerType::Black;
            }

            // check the nft belongs to the player
            let mut nft = get!(world, (1,player,playerType,nftRideId), ERC721);
            if nft.owner != player {
                return ();
            }

            let mut cell = get!(world, fenPos, Cell);
            cell.nftRideId = nftRideId;

            nft.ownerType = PlayerType::Board;
            // nft.owner = ContractAddress::new(0);

            set!(world, (nft));

            set!(world, (cell));
        }

        fn assign_tokens(ref world: IWorldDispatcher, fenPos: u64, tokenQuantity: u64) {
            let board = get!(world, 1, Board);
            if board.is_started == true {
                return ();
            }

            if board.is_finished {
                return ();
            }

            let player = get_caller_address();

            let mut playerType = PlayerType::White;
            if fenPos < 32 {
                playerType = PlayerType::Black;
            }

            let mut erc20Player = get!(world, (1,player,playerType), ERC20);
            if erc20Player.owner != player {
                return ();
            }
            if erc20Player.balance < tokenQuantity {
                return ();
            }
            erc20Player.balance = erc20Player.balance - tokenQuantity;
            set!(world, (erc20Player));

            let mut cell = get!(world, fenPos, Cell);
            cell.tokenQuantity = tokenQuantity;
            set!(world, (cell));
        }

        fn startGame(ref world: IWorldDispatcher) {
            let mut board = get!(world, 1, Board);
            if board.is_started == true {
                return ();
            }
            if board.is_finished {
                return ();
            }
            // check if all players have approved the game
            board.is_started = true;
            set!(world, (board));
        }
    }
}

