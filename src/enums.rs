use peppi::character::External;
use peppi::game::TeamColor;
use peppi::stage::Stage;

// I'd like to apologize for this code.
// TODO: macros?
pub fn stage(stage: Stage) -> Option<String> {
    let name = match stage {
        Stage::FOUNTAIN_OF_DREAMS => "FOUNTAIN_OF_DREAMS",
        Stage::POKEMON_STADIUM => "POKEMON_STADIUM",
        Stage::PRINCESS_PEACHS_CASTLE => "PRINCESS_PEACHS_CASTLE",
        Stage::KONGO_JUNGLE => "KONGO_JUNGLE",
        Stage::BRINSTAR => "BRINSTAR",
        Stage::CORNERIA => "CORNERIA",
        Stage::YOSHIS_STORY => "YOSHIS_STORY",
        Stage::ONETT => "ONETT",
        Stage::MUTE_CITY => "MUTE_CITY",
        Stage::RAINBOW_CRUISE => "RAINBOW_CRUISE",
        Stage::JUNGLE_JAPES => "JUNGLE_JAPES",
        Stage::GREAT_BAY => "GREAT_BAY",
        Stage::HYRULE_TEMPLE => "HYRULE_TEMPLE",
        Stage::BRINSTAR_DEPTHS => "BRINSTAR_DEPTHS",
        Stage::YOSHIS_ISLAND => "YOSHIS_ISLAND",
        Stage::GREEN_GREENS => "GREEN_GREENS",
        Stage::FOURSIDE => "FOURSIDE",
        Stage::MUSHROOM_KINGDOM_I => "MUSHROOM_KINGDOM_I",
        Stage::MUSHROOM_KINGDOM_II => "MUSHROOM_KINGDOM_II",
        Stage::VENOM => "VENOM",
        Stage::POKE_FLOATS => "POKE_FLOATS",
        Stage::BIG_BLUE => "BIG_BLUE",
        Stage::ICICLE_MOUNTAIN => "ICICLE_MOUNTAIN",
        Stage::ICETOP => "ICETOP",
        Stage::FLAT_ZONE => "FLAT_ZONE",
        Stage::DREAM_LAND_N64 => "DREAM_LAND_N64",
        Stage::YOSHIS_ISLAND_N64 => "YOSHIS_ISLAND_N64",
        Stage::KONGO_JUNGLE_N64 => "KONGO_JUNGLE_N64",
        Stage::BATTLEFIELD => "BATTLEFIELD",
        Stage::FINAL_DESTINATION => "FINAL_DESTINATION",
        _ => "",
    };

    if name != "" {
        return Some(name.to_string());
    } else {
        return None;
    }
}

pub fn team(team: TeamColor) -> Option<String> {
    let name = match team {
        TeamColor::RED => "RED",
        TeamColor::BLUE => "BLUE",
        TeamColor::GREEN => "GREEN",
        _ => "",
    };

    if name != "" {
        return Some(name.to_string());
    } else {
        return None;
    }
}

pub fn character(character: External) -> Option<String> {
    let name = match character {
        External::CAPTAIN_FALCON => "CAPTAIN_FALCON",
        External::DONKEY_KONG => "DONKEY_KONG",
        External::FOX => "FOX",
        External::GAME_AND_WATCH => "GAME_AND_WATCH",
        External::KIRBY => "KIRBY",
        External::BOWSER => "BOWSER",
        External::LINK => "LINK",
        External::LUIGI => "LUIGI",
        External::MARIO => "MARIO",
        External::MARTH => "MARTH",
        External::MEWTWO => "MEWTWO",
        External::NESS => "NESS",
        External::PEACH => "PEACH",
        External::PIKACHU => "PIKACHU",
        External::ICE_CLIMBERS => "ICE_CLIMBERS",
        External::JIGGLYPUFF => "JIGGLYPUFF",
        External::SAMUS => "SAMUS",
        External::YOSHI => "YOSHI",
        External::ZELDA => "ZELDA",
        External::SHEIK => "SHEIK",
        External::FALCO => "FALCO",
        External::YOUNG_LINK => "YOUNG_LINK",
        External::DR_MARIO => "DR_MARIO",
        External::ROY => "ROY",
        External::PICHU => "PICHU",
        External::GANONDORF => "GANONDORF",
        External::MASTER_HAND => "MASTER_HAND",
        External::WIRE_FRAME_MALE => "WIRE_FRAME_MALE",
        External::WIRE_FRAME_FEMALE => "WIRE_FRAME_FEMALE",
        External::GIGA_BOWSER => "GIGA_BOWSER",
        External::CRAZY_HAND => "CRAZY_HAND",
        External::SANDBAG => "SANDBAG",
        External::POPO => "POPO",
        _ => "",
    };

    if name != "" {
        Some(name.to_string())
    } else {
        None
    }
}
