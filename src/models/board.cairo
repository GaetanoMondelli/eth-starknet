use starknet::ContractAddress;

trait TypeTrait {
    fn is_white(self: Type) -> bool;
    fn is_black(self: Type) -> bool;
    fn is_empty(self: Type) -> bool;
    fn is_pawn(self: Type) -> bool;
    fn is_rook(self: Type) -> bool;
    fn is_knight(self: Type) -> bool;
    fn is_bishop(self: Type) -> bool;
    fn is_queen(self: Type) -> bool;
    fn is_king(self: Type) -> bool;
}

#[derive(Serde, Copy, Drop, Introspect, PartialEq)]
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

impl TypeImpl of TypeTrait {
    fn is_white(self: Type) -> bool {
        match self {
            Type::PAWN => true,
            Type::ROOK => true,
            Type::KNIGHT => true,
            Type::BISHOP => true,
            Type::QUEEN => true,
            Type::KING => true,
            _ => false,
        }
    }

    fn is_black(self: Type) -> bool {
        match self {
            Type::pawn => true,
            Type::rook => true,
            Type::knight => true,
            Type::bishop => true,
            Type::queen => true,
            Type::king => true,
            _ => false,
        }
    }

    fn is_empty(self: Type) -> bool {
        match self {
            Type::Empty => true,
            _ => false,
        }
    }

    fn is_pawn(self: Type) -> bool {
        match self {
            Type::PAWN => true,
            Type::pawn => true,
            _ => false,
        }
    }

    fn is_rook(self: Type) -> bool {
        match self {
            Type::ROOK => true,
            Type::rook => true,
            _ => false,
        }
    }

    fn is_knight(self: Type) -> bool {
        match self {
            Type::KNIGHT => true,
            Type::knight => true,
            _ => false,
        }
    }

    fn is_bishop(self: Type) -> bool {
        match self {
            Type::BISHOP => true,
            Type::bishop => true,
            _ => false,
        }
    }

    fn is_queen(self: Type) -> bool {
        match self {
            Type::QUEEN => true,
            Type::queen => true,
            _ => false,
        }
    }

    fn is_king(self: Type) -> bool {
        match self {
            Type::KING => true,
            Type::king => true,
            _ => false,
        }
    }
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
    fenPos: u64,
    value: Type,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct Board {
    #[key]
    id: u64,
    white_player: ContractAddress,
    black_player: ContractAddress,
    turn: bool,
}


