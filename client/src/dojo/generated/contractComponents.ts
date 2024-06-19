/* Autogenerated file. Do not edit manually. */

import { defineComponent, Type as RecsType, World } from "@dojoengine/recs";

export type ContractComponents = Awaited<ReturnType<typeof defineContractComponents>>;

export function defineContractComponents(world: World) {
  return {
    Player: (() => {
      return defineComponent(
        world,
        { address: RecsType.BigInt, player: RecsType.Number, last_action: RecsType.BigInt },
        {
          metadata: {
            name: "Player",
            types: ["contractaddress","u32","u64"],
            customTypes: [],
          },
        }
      );
    })(),
    // Tile: (() => {
    //   return defineComponent(
    //     world,
    //     { x: RecsType.Number, y: RecsType.Number, color: RecsType.BigInt },
    //     {
    //       metadata: {
    //         name: "Tile",
    //         types: ["u16","u16","felt252"],
    //         customTypes: [],
    //       },
    //     }
    //   );
    // })(),
    Cell: (() => {
      return defineComponent(
        world,
        { fenPos: RecsType.Number, value: RecsType.String },
        {
          metadata: {
            name: "Cell",
            types: ["u64","Type"],
            customTypes: [],
          },
        }
      );
    })(),
    Board: (() => {
      return defineComponent(
        world,
        { id: RecsType.Number, white_player: RecsType.String, black_player: RecsType.String, turn: RecsType.Boolean, is_finished: RecsType.Boolean, winner: RecsType.String},
        {
          metadata: {
            name: "Board",
            types: ["u64","ContractAddress","ContractAddress","bool", "bool", "ContractAddress"],
            customTypes: [],
          },
        }
      );
    })(),
  };
}
