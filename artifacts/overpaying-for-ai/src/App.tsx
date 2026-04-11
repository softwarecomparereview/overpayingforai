import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Home } from "@/pages/Home";
import { Calculator } from "@/pages/Calculator";
import { DecisionEngine } from "@/pages/DecisionEngine";
import { ComparePage, CompareIndex } from "@/pages/ComparePage";
import { BestPage, BestIndex } from "@/pages/BestPage";
import { GuidePage, GuideIndex } from "@/pages/GuidePage";
import { PricingRefreshPage } from "@/pages/admin/PricingRefreshPage";
import { Design1 } from "@/pages/Design1";
import { Design2 } from "@/pages/Design2";
import { Design3 } from "@/pages/Design3";
import { ResourcesHub } from "@/pages/ResourcesHub";
import { ChangelogPage } from "@/pages/ChangelogPage";
import { PricingChangelogPage } from "@/pages/PricingChangelogPage";
import { AiTypeIndex } from "@/pages/AiTypeIndex";
import { AiTypePage } from "@/pages/AiTypePage";
import { Terms } from "@/pages/Terms";
import { MediaKit } from "@/pages/MediaKit";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/admin/pricing-refresh" component={PricingRefreshPage} />
      <Route>
        {() => (
          <Layout>
            <Switch>
              <Route path="/" component={Design2} />
              <Route path="/home-v1" component={Home} />
              <Route path="/design1" component={Design1} />
              <Route path="/design2" component={Design2} />
              <Route path="/design3" component={Design3} />
              <Route path="/resources" component={ResourcesHub} />
              <Route path="/changelog" component={ChangelogPage} />
              <Route path="/pricing-changelog" component={PricingChangelogPage} />
              <Route path="/ai-types" component={AiTypeIndex} />
              <Route path="/ai-types/:slug" component={AiTypePage} />
              <Route path="/calculator" component={Calculator} />
              <Route path="/decision-engine" component={DecisionEngine} />
              <Route path="/compare" component={CompareIndex} />
              <Route path="/compare/:slug" component={ComparePage} />
              <Route path="/best" component={BestIndex} />
              <Route path="/best/:slug" component={BestPage} />
              <Route path="/guides" component={GuideIndex} />
              <Route path="/guides/:slug" component={GuidePage} />
              <Route path="/terms" component={Terms} />
              <Route path="/media-kit" component={MediaKit} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
