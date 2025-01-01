import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataRepoService} from "../../services/data-repo.service";
import {GameContextService} from "../../services/game-context.service";
import {IApiSaFixtureFull, IApiSaLineupPlayer, IApiSaLineupResponse} from "../../models/ApiSaModels";
import {Subject, takeUntil} from "rxjs";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";

interface IPlayerStats {
  rating?: number,
  goals?: number,
  yellowCards?: number,
  redCards?: number;
  hasStats : boolean
}

@UntilDestroy()
@Component({
    selector: 'app-game-lineups',
    imports: [CommonModule],
    templateUrl: './game-lineups.component.html',
    styleUrl: './game-lineups.component.scss'
})
export class GameLineupsComponent {

  gameId!: number;
  game: IApiSaFixtureFull | null = null;

  lineups: IApiSaLineupResponse | null = null;

  startIXHome: (IApiSaLineupPlayer & IPlayerStats)[] | null = null;
  startIXAway: (IApiSaLineupPlayer & IPlayerStats)[] | null = null;

  substitutesHome: (IApiSaLineupPlayer & IPlayerStats)[] | null = null;
  substitutesAway: (IApiSaLineupPlayer & IPlayerStats)[] | null = null;



  constructor(private repo: DataRepoService, private gameContext: GameContextService) {
    gameContext.gameId.pipe(untilDestroyed(this)).subscribe(val => {
      this.gameId = val;
    });
    gameContext.game.pipe(untilDestroyed(this)).subscribe(async val => {
      this.game = val;
      await this.loadLineups();
    })
  }

  async loadLineups() {
    if (!this.game) return;

    let r = await this.repo.getGameLineups(this.gameId!);
    console.debug(r);
    this.lineups = r;

    const positionsOrder = ['G', 'D', 'M', 'F'];

    let statsDic: Record<number, { Name: string, Value: number }[]> = r.PlayersStats?.reduce((a, v) => ({
      ...a,
      [v.PlayerId]: v.Stats
    }), {});

    function mapPlayerStats(p: IApiSaLineupPlayer) {
      return {
        ...p,
        hasStats : !!statsDic[p.Id],
        rating: statsDic[p.Id]?.find(j => j.Name == "Rating")?.Value,
        goals: statsDic[p.Id]?.find(j => j.Name == "Goals Total")?.Value,
        yellowCards: statsDic[p.Id]?.find(j => j.Name == "Cards Yellow")?.Value,
        redCards: statsDic[p.Id]?.find(j => j.Name == "Cards Red")?.Value
      }
    }

    this.startIXHome = r.Players.filter(i => i.IsStartXI && i.TeamId == this.game!.HomeTeam.Id).map(i => mapPlayerStats(i))
      .sort((a, b) => positionsOrder.indexOf(b.Position ?? '') - positionsOrder.indexOf(a.Position ?? ''));
    this.startIXAway = r.Players.filter(i => i.IsStartXI && i.TeamId == this.game!.AwayTeam.Id).map(i => mapPlayerStats(i))
      .sort((a, b) => positionsOrder.indexOf(b.Position ?? '') - positionsOrder.indexOf(a.Position ?? ''));
    this.substitutesHome = r.Players.filter(i => !i.IsStartXI && i.TeamId == this.game!.HomeTeam.Id).map(i => mapPlayerStats(i))
      .sort((a, b) => positionsOrder.indexOf(b.Position ?? '') - positionsOrder.indexOf(a.Position ?? ''));
    this.substitutesAway = r.Players.filter(i => !i.IsStartXI && i.TeamId == this.game!.AwayTeam.Id).map(i => mapPlayerStats(i))
      .sort((a, b) => positionsOrder.indexOf(b.Position ?? '') - positionsOrder.indexOf(a.Position ?? ''));

    let playerStats = this.lineups.PlayersStats;

    setTimeout(() => {
      // @ts-ignore
      let q = document.querySelectorAll('#lineups [data-bs-toggle="popover"]');
      q.forEach(i => {
        let playerId = (i as HTMLElement)?.dataset['playerId'];
        if (!playerId) return;

        let player = playerStats.find(i => i.PlayerId == parseInt(playerId!))!;
        let stats = player.Stats.map(i => `<div class="d-flex border-bottom"><div class="me-2">${i.Name}</div><div class="ms-auto">${i.Value}</div></div>`).join('');

        // @ts-ignore
        var popover = new bootstrap.Popover(i, {
          html: true,
          trigger : 'focus',
          sanitize: false,
          content: `<div><b>${player.PlayerName}</b></div>${stats}`,
        });
      })
    }, 100)
  }


}
