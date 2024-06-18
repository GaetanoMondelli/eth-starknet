use dojo_starter::models::moves::Direction;
use dojo_starter::models::position::Position;
use dojo_starter::models::board::ChessBoard; 
// use dojo_starter::models::piece::ChessBoard;

// define the interface
#[dojo::interface]
trait IActions {
    fn spawn(ref world: IWorldDispatcher);
    // fn move(ref world: IWorldDispatcher, direction: Direction);
}

// dojo decorator
#[dojo::contract]
mod actions {
    // use super::{IActions, next_position};
    use super::{IActions};
    use starknet::{ContractAddress, get_caller_address};
    use dojo_starter::models::{
        position::{Position, Vec2},
        // moves::{Moves, Direction, 
        // DirectionsAvailable}
        // board::ChessBoard
    };

    // #[derive(Copy, Drop, Serde)]
    // #[dojo::model]
    // #[dojo::event]
    // struct Moved {
    //     #[key]
    //     player: ContractAddress,
    //     direction: Direction,
    // }

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn spawn(ref world: IWorldDispatcher) {
            // Get the address of the current caller, possibly the player's address.
            let player = get_caller_address();
            set!(
                world,
                (
                    Position {
                        player, vec: Vec2 { x: 0, y: 0 }
                    }
                    // ChessBoard { id: 1,
                    //     player,
                    //     opponent: player,
                    //     turn: false,
                    //     // board: [0; 64],
                    //  }
                            // directions_available
                )
            );
        }

        // // Implementation of the move function for the ContractState struct.
        // fn move(ref world: IWorldDispatcher, direction: Direction) {
        //     // Get the address of the current caller, possibly the player's address.
        //     let player = get_caller_address();

        //     // Retrieve the player's current position and moves data from the world.
        //     let (mut position, mut moves) = get!(world, player, (Position, Moves));

        //     // Deduct one from the player's remaining moves.
        //     moves.remaining -= 1;

        //     // Update the last direction the player moved in.
        //     moves.last_direction = direction;

        //     // Calculate the player's next position based on the provided direction.
        //     let next = next_position(position, direction);

        //     // Update the world state with the new moves data and position.
        //     set!(world, (moves, next));
        //     // Emit an event to the world to notify about the player's move.
        //     emit!(world, (Moved { player, direction }));
        // }
    }
}

