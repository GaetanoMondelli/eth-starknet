use starknet::ContractAddress;

#[derive(Serde, Copy, Drop, Introspect)]
enum Type {
    pawn,
    rook,
    knight,
    bishop,
    queen,
    king,
    PAWN,
    ROOK,
    KNIGHT,
    BISHOP,
    QUEEN,
    KING,
    EMPTY, // empty square
}


struct ChessBoard {
    #[key]
    id: u64,
    player: ContractAddress,
    // owner: ContractAddress,
    opponent: ContractAddress,
    turn: bool,
    // board: [Type; 64],
}


