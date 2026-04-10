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
              <Route path="/" component={Home} />
              <Route path="/calculator" component={Calculator} />
              <Route path="/decision-engine" component={DecisionEngine} />
              <Route path="/compare" component={CompareIndex} />
              <Route path="/compare/:slug" component={ComparePage} />
              <Route path="/best" component={BestIndex} />
              <Route path="/best/:slug" component={BestPage} />
              <Route path="/guides" component={GuideIndex} />
              <Route path="/guides/:slug" component={GuidePage} />
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
