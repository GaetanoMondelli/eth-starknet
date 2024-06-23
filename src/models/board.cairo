use starknet::ContractAddress;

#[derive(Serde, Copy, Drop, Introspect, PartialEq)]
enum PlayerType {
    White,
    Black,
    Board,
} 


impl PlayerTypeIntoFelt252 of Into<PlayerType, felt252> {
    fn into(self: PlayerType) -> felt252 {
        match self {
            PlayerType::White => 0,
            PlayerType::Black => 1,
            PlayerType::Board => 2,
        }
    }
}

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
    Empty,
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
            Type::pawn => 1,
            Type::rook => 2,
            Type::knight => 3,
            Type::bishop => 4,
            Type::queen => 5,
            Type::king => 6,
            Type::PAWN => 7,
            Type::ROOK => 8,
            Type::KNIGHT => 9,
            Type::BISHOP => 10,
            Type::QUEEN => 11,
            Type::KING => 12,
        }
    }
}

#[derive(Serde, Copy, Drop, Introspect)]
#[dojo::model]
struct Cell {
    #[key]
    fenPos: u64,
    value: Type,
    nftRideId: u64,
    tokenQuantity: u64,
}

#[derive(Serde, Copy, Drop, Introspect)]
#[dojo::model]
struct ERC20 {
    #[key]
    addressId: u64,
    ownerType: PlayerType,
    // #[key]
    id: u64,
    // #[key]
    owner: ContractAddress,
    balance: u64,
}

#[derive(Serde, Copy, Drop, Introspect)]
#[dojo::model]
struct ERC721 {
    #[key]
    nftId: u64,
    // #[key]
    id: u64,
    // #[key]
    owner: ContractAddress,
    // #[key]
    ownerType: PlayerType,
    attribute: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct Board {
    #[key]
    id: u64,
    white_player: ContractAddress,
    black_player: ContractAddress,
    turn: bool,
    is_started: bool,
    is_finished: bool,
    winner: ContractAddress,
}

