import * as Phaser from "phaser";
import { CONFIGS } from "./configs";
import { GAME_STATE, TEXTURES } from "./constants";
import { BirdComponent } from "./views/bird-component";

export class GameScene extends Phaser.Scene {
  private _bg: Phaser.GameObjects.TileSprite;
  private _bird: BirdComponent;
  private _state: string = GAME_STATE.undefined;

  private _isPressed = false;

  public create(): void {
    this.events.on("stateUpdate", (newState: string) => this._onStateUpdate(newState));

    this._buildBg();
    this._buildBird();

    this._setGameState(GAME_STATE.preAction);
  }

  public update(): void {
    switch (this._state) {
      case GAME_STATE.action:
        this._actionsUpdates();
        break;
      case GAME_STATE.die:
        this._dieUpdates();
        break;

      default:
        break;
    }
  }

  private _onStateUpdate(state: string): void {
    console.warn(state);

    switch (state) {
      case GAME_STATE.preAction:
        this._reset();
        break;
      case GAME_STATE.die:
        this._bird.die();
        break;
      default:
        break;
    }
  }

  private _onPointerDown(e: PointerEvent): void {
    this._isPressed = !this._isPressed;

    if (!this._isPressed) {
      if (e.cancelable) {
        e.preventDefault();
      }

      switch (this._state) {
        case GAME_STATE.action:
          this._bird.jump();
          break;
        case GAME_STATE.preAction:
          this._setGameState(GAME_STATE.action);
          this._startAction();
          break;
        case GAME_STATE.die:
          this._setGameState(GAME_STATE.preAction);
          break;

        default:
          break;
      }
    }
  }

  private _actionsUpdates(): void {
    if (this._bird.y > this.game.config.height) {
      this._setGameState(GAME_STATE.die);
    }

    if (this._bird.y <= 0) {
      this._bird.y = 0;
      this._bird.body.velocity.y = 0;
    }

    this._bird.update();
    this._bg.tilePositionX += CONFIGS.speed;
  }

  private _dieUpdates(): void {
    if (this._bird.y > +this.game.config.height) {
      this._bird.y = +this.game.config.height - 5;
      this._bird.disablePhysics();
    }
  }

  private _setGameState(state: string): void {
    if (this._state !== state) {
      this.events.emit("stateUpdate", state);
      this._state = state;
    }
  }

  private _startAction(): void {
    this._bird.enablePhysics();
    this._bird.jump();
  }

  private _reset(): void {
    this._bird.resetPosition();
  }

  private _buildBg(): void {
    this._bg = this.add.tileSprite(256, 256, 512, 512, TEXTURES, "bg.png");
    this._bg.setInteractive();
    this._bg.on("pointerdown", (e: PointerEvent) => this._onPointerDown(e));
  }

  private _buildBird(): void {
    this.add.existing((this._bird = new BirdComponent(this)));
    this._bird.setDepth(2);
  }
}
