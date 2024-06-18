use starknet::ContractAddress;

#[derive(Serde, Copy, Drop, Introspect)]
enum Type {
    Empty, // empty square
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
}

impl TypeIntoFelt252 of Into<Type, felt252> {
    fn into(self: Type) -> felt252 {
        match self {
            Type::Empty => 0,
            Type::PAWN => 1,
            Type::ROOK => 2,
            Type::KNIGHT => 3,
            Type::BISHOP => 4,
            Type::QUEEN => 5,
            Type::KING => 6,
            Type::pawn => 7,
            Type::rook => 8,
            Type::knight => 9,
            Type::bishop => 10,
            Type::queen => 11,
            Type::king => 12,
        }
    }
}


#[derive(Serde, Copy, Drop, Introspect)]
#[dojo::model]
struct Cell {
    #[key]
    id: u64,
    #[key]
    fenPos: u64,
    value: Type,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct Board {
    #[key]
    id: u64,
    player: ContractAddress,
    opponent: ContractAddress,
    turn: bool,
}


