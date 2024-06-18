use starknet::ContractAddress;

#[derive(Serde, Copy, Drop, Introspect)]
enum Color {
    White,
    Black,
}

enum Type {
    Pawn,
    Rook,
    Knight,
    Bishop,
    Queen,
    King,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct Piece {
    #[key]
    color: Color,
    #[key]
    type: Type,
    // player: ContractAddress,
    // vec: Vec2,
}

