import {Routes} from '@angular/router';
import {MainPageComponent} from "./pages/main-page/main-page.component";
import {TournamentViewComponent} from "./pages/tournament-view/tournament-view.component";
import {GamePageComponent} from "./pages/game-page/game-page.component";
import {GameSummaryComponent} from "./pages/game-summary/game-summary.component";
import {GameStatisticsComponent} from "./pages/game-statistics/game-statistics.component";
import {GameLineupsComponent} from "./pages/game-lineups/game-lineups.component";
import {GameOddsComponent} from "./pages/game-odds/game-odds.component";
import {GameAnalyticsComponent} from "./pages/game-analytics/game-analytics.component";
import {GameH2hComponent} from "./pages/game-h2h/game-h2h.component";
import {AboutPageComponent} from "./pages/about-page/about-page.component";
import {FaqPageComponent} from "./pages/faq-page/faq-page.component";
import {FeedbackPageComponent} from "./pages/feedback-page/feedback-page.component";
import {MessageBoardPageComponent} from "./pages/message-board-page/message-board-page.component";
import {NewsPageComponent} from "./pages/news-page/news-page.component";
import {NewsViewPageComponent} from "./pages/news-view-page/news-view-page.component";
import {GameEventsComponent} from "./pages/game-events/game-events.component";
import {FlashIdConvertComponent} from "./pages/flash-id-convert/flash-id-convert.component";
import {AdvancedSearchPageComponent} from "./pages/advanced-search-page/advanced-search-page.component";
import {StrategyTestPageComponent} from "./pages/strategy-test-page/strategy-test-page.component";
import {LeaguesStatsPageComponent} from "./pages/leagues-stats-page/leagues-stats-page.component";
import {ApiPageComponent} from "./pages/api-page/api-page.component";
import {LoginPageComponent} from "./pages/login-page/login-page.component";
import {ProfilePageComponent} from "./pages/profile-page/profile-page.component";
import {authGuard} from "./guards/auth.guard";
import {notLoggedGuard} from "./guards/not-logged.guard";
import {GameProfitsPageComponent} from "./pages/game-profits-page/game-profits-page.component";

export const routes: Routes = [
  {path: 't/:id/:season', component: TournamentViewComponent},
  {path: 't/:id', component: TournamentViewComponent, title: "SStats.net - Матчи лиги"},
  {
    path: 'g/:id', component: GamePageComponent, children: [
      {path: '', pathMatch: "full", redirectTo: 'summary'},
      {path: 'summary', component: GameSummaryComponent},
      {path: 'statistics', component: GameStatisticsComponent},
      {path: 'lineups', component: GameLineupsComponent},
      {path: 'odds', component: GameOddsComponent},
      {path: 'h2h', component: GameH2hComponent},
      {path: 'analytics', component: GameAnalyticsComponent},
      {path: 'events', component: GameEventsComponent},
      {path: 'profits', component: GameProfitsPageComponent}
    ]
  },
  {
    path: '',
    component: MainPageComponent,
    pathMatch: "full",
    title: 'SStats.net - Футбольная статистика. База данных, Бесплатное API'
  },
  {path: 'about', component: AboutPageComponent, title: "О сайте :: Stats.net"},
  {path: 'faq', component: FaqPageComponent, title : "FAQ - Часто задаваемые вопросы, техподдержка :: SStats.net"},
  {path: 'feedback', component: FeedbackPageComponent, title : "Обратная связь, контактные данные :: Stats.net"},
  {path: 'message-board', component: MessageBoardPageComponent},
  {path: 'api', component: ApiPageComponent, title : "API футбол. База данных футбольных матчей. Бесплатно :: SStats.net"},
  {
    path: 'news', component: NewsPageComponent, title : "Новости и статьи :: Stats.net", children: [
      {path: ':id', component: NewsViewPageComponent}
    ]
  },
  {
    path: 'flash-id-convert', component: FlashIdConvertComponent, title : "Конвертировать id матча Flashscore в Sstats.net"
  },
  {path: 'advanced-search', component: AdvancedSearchPageComponent},
  {path: 'strategy-testing-request', component: StrategyTestPageComponent, title : "Тестировать футбольную стратегию :: Stats.net"},
  {path: 'leagues-stats', component: LeaguesStatsPageComponent},
  {path: "login", component: LoginPageComponent, canActivate: [notLoggedGuard], title : "Вход / Регистрация :: Stats.net"},
  {path: "profile", component: ProfilePageComponent, canActivate: [authGuard], title : "Мой профиль :: Stats.net"},
];
