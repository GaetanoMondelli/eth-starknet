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

            set!(
                world,
                (
                    Cell {
                        id: 1,
                        fenPos: 0,
                        value: Type::ROOK,
                    },
                )
            );



        }
    }
}

