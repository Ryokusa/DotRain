import Game from "./engine/Game";

export let mainGame: Game|undefined = undefined;

export const setMainGame = (game: Game) => {
    mainGame = game
}