/* eslint-disable @typescript-eslint/no-explicit-any */
import { Chess } from "chess.js";

/**
 * Given a list of the moves in a chess game, return the squares where the pieces were captured.
 * Basic logic is to track the last move of each piece using a dict, and delete that piece
 * from dict when the piece is captured.
 * @param  {String} chessMovesList        all the moves that were played in a game
 * @return {Dict}   finalCapturedPieces   squares where the pieces were captured
 */

export const pieceTracking: unknown = {
  wra: {},
  wnb: {},
  wbc: {},
  wqd: {},
  wke: {},
  wbf: {},
  wng: {},
  wrh: {},
  wpa: {},
  wpb: {},
  wpc: {},
  wpd: {},
  wpe: {},
  wpf: {},
  wpg: {},
  wph: {},
  bra: {},
  bnb: {},
  bbc: {},
  bqd: {},
  bke: {},
  bbf: {},
  bng: {},
  brh: {},
  bpa: {},
  bpb: {},
  bpc: {},
  bpd: {},
  bpe: {},
  bpf: {},
  bpg: {},
  bph: {},
};

export const boardNotation: any = {
  wra: "a1",
  wnb: "b1",
  wbc: "c1",
  wqd: "d1",
  wke: "e1",
  wbf: "f1",
  wng: "g1",
  wrh: "h1",
  wpa: "a2",
  wpb: "b2",
  wpc: "c2",
  wpd: "d2",
  wpe: "e2",
  wpf: "f2",
  wpg: "g2",
  wph: "h2",
  bra: "a8",
  bnb: "b8",
  bbc: "c8",
  bqd: "d8",
  bke: "e8",
  bbf: "f8",
  bng: "g8",
  brh: "h8",
  bpa: "a7",
  bpb: "b7",
  bpc: "c7",
  bpd: "d7",
  bpe: "e7",
  bpf: "f7",
  bpg: "g7",
  bph: "h7",
};

export function processGame(chessMovesList: any, options: any = {}) {
  const chess = new Chess();
  chess.loadPgn(chessMovesList);
  // To keep track of individual chess pieces
  const chessPieces: any = {};
  const finalCapturedPieces: any = {};
  const chessMoves = chess.history({ verbose: true });
  // Iterate over all the chess moves
  for (let i = 0; i < chessMoves.length; i++) {
    const currMove = chessMoves[i];
    const currMoveFile = currMove.from.charAt(0);
    // Uniquely identify each chess piece, for better searching
    // For example: white's a file rook -> wra
    let piece = currMove.color + currMove.piece + currMoveFile;

    // If castling, move the rook to it's new place
    if (currMove.san === "O-O") {
      const rookPiece = currMove.color + "rh";
      chessPieces[rookPiece] = currMove.color === "w" ? ["f1"] : ["f8"];
    }
    if (currMove.san === "O-O-O") {
      const rookPiece = currMove.color + "ra";
      chessPieces[rookPiece] = currMove.color === "w" ? ["d1"] : ["d8"];
    }

    /*
     * If the piece moves in the same file, it'll be identified correctly.
     * But, if the piece moves to a different file, we can find the original
     * square by looking where it was at it's previous move.
     * For example: Initially, if Ra1 moves to Rb1 -> chessPieces[wra] = [b1]
     * If it now moves to Rc1, we have no idea where did it originally belong to.
     * It could be the right side rook too (Rh8), who knows? So, we check in the
     * chessPieces, where did it move from and then it's key would be the original piece.
     */
    Object.entries(chessPieces).forEach(([k, val]) => {
      const lastPiece = k.charAt(1);
      // Check last piece and current piece to make sure other pieces which moved from that
      // square won't be included. For example: Nc3 -> Nd5 and then later at some point c3 -> c4
      if (val === currMove.from && lastPiece === currMove.piece) {
        piece = k;
      }
    });

    // If there's a capture, track that captured piece by locating where it last moved to.
    if (
      currMove.flags === "c" ||
      currMove.flags === "e" ||
      currMove.flags === "cp"
    ) {
      let capturedPiece;
      // Search for the captured piece
      Object.entries(chessPieces).forEach(([k, val]) => {
        if (currMove.flags === "c" || currMove.flags === "cp") {
          if (val === currMove.to) {
            capturedPiece = k;
          }
        }
        // En Passant
        if (currMove.flags === "e") {
          const capturedColor = currMove.color === "w" ? "b" : "w";
          const capturedFile = currMove.to.charAt(0);
          capturedPiece = capturedColor + "p" + capturedFile;
        }
      });
      // If piece is captured at original location. For example: Nb1
      if (!chessPieces[capturedPiece as any]) {
        const capturedColor = currMove.color === "w" ? "b" : "w";
        const capturedFile = currMove.to.charAt(0);
        const capturedPiece = capturedColor + currMove.captured + capturedFile;
        finalCapturedPieces[boardNotation[capturedPiece]] = currMove.to;
      } else {
        /*
         * Update the square of captured piece in final captured pieces and delete
         * it from tracking it further. If we don't delete it, there can be
         * pieces with multiple same squares, like a dead piece sitting at an
         * alive piece's square.
         */
        finalCapturedPieces[boardNotation[capturedPiece as any]] =
          chessPieces[capturedPiece as any];
        delete chessPieces[capturedPiece as any];
      }
    }
    // If a pawn is promoted, it's now considered to be captured, and no need to track the promoted piece.
    if (currMove.flags === "cp" || currMove.flags === "np") {
      chessPieces[piece] = currMove.to;
      finalCapturedPieces[boardNotation[piece]] = chessPieces[piece];
      delete chessPieces[piece];
      // Uniquely identify the promoted piece, but ignore if it's captured in the future.
      piece = piece + "P";
    }
    // Update or create the piece's location
    if (!chessPieces[piece] || chessPieces[piece]) {
      chessPieces[piece] = currMove.to;
    }
  }
  // If promoted piece gets captured later, it gives undefined as boardNotation doesn't have notation for it, so remove that undefined.
  Object.keys(finalCapturedPieces).forEach((key) => {
    if (key === "undefined") {
      delete finalCapturedPieces[key];
    }
  });

  // Update the final king's square if there's a checkmate.
  if (chess.isCheckmate()) {
    const king = chess.turn() + "ke";
    if (chessPieces[king]) {
      finalCapturedPieces[boardNotation[king]] = chessPieces[king];
    } else {
      finalCapturedPieces[boardNotation[king]] =
        chess.turn() === "b" ? "e1" : "e8";
    }
  }
  if (options.verbose === true) {
    const d = finalCapturedPieces;
    // Iterate over chessPieces to convert from the boardNotation
    Object.entries(chessPieces).forEach(([key, value]) => {
      const k = chessPieces[boardNotation[key]];
      d[k] = value;
    });
    // Add those pieces which haven't moved yet
    Object.entries(boardNotation).forEach(([key, value]) => {
      console.log("key", key);
      if (!d[value as any]) {
        d[value as any] = value;
      }
    });
    // Remove undefined pieces
    Object.keys(d).forEach((key) => {
      if (key === "undefined") {
        delete d[key];
      }
    });
    return chessPieces;
  }
  return finalCapturedPieces;
}
