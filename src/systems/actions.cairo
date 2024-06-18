use dojo_starter::models::board::{Board};
use dojo_starter::models::board::{Cell};
use dojo_starter::models::board::{Type};


// define the interface
#[dojo::interface]
trait IActions {
    fn spawn(ref world: IWorldDispatcher);
}

// dojo decorator
#[dojo::contract]
mod actions {
    // use super::{IActions, next_position};
    use super::{IActions};
    use starknet::{ContractAddress, get_caller_address};
    use dojo_starter::models::{
        board::{Board, Cell, Type},
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
                        player,
                        opponent: player,
                        turn: false,
                    },
                )
            );

            let mut i: u64 = 0;

            loop {
                if i >= 64 { // Break condition
                    break ();
                }
                
                let mut t_type = Type::PAWN;

                // capital letters are white pieces
                // small letters are black pieces
                if i == 0 || i == 7  {
                    t_type = Type::ROOK;
                } else if i == 56 || i == 63 {
                    t_type = Type::rook;
                } else if i == 1 || i == 6 {
                    t_type = Type::KNIGHT;
                } else if i == 57 || i == 62 {
                    t_type = Type::knight;
                } else if i == 2 || i == 5 {
                    t_type = Type::BISHOP;
                } else if i == 58 || i == 61 {
                    t_type = Type::bishop;
                } else if i == 3 {
                    t_type = Type::QUEEN;
                } else if i == 59 {
                    t_type = Type::queen;
                } else if i == 4 {
                    t_type = Type::KING;
                } else if i == 60 {
                    t_type = Type::king;
                } else if i >= 8 && i < 16 {
                    t_type = Type::PAWN;
                } else if i >= 48 && i < 56 {
                    t_type = Type::pawn;
                } else {
                    t_type = Type::Empty;
                }
                
                set!(
                    world,
                    (
                        Cell {
                            id: i,
                            fenPos: i,
                            value: t_type,
                        },
                    )
                );
                i = i + 1;
            };
        }
    }
}

