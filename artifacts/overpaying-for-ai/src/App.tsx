import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Home } from "@/pages/Home";
import { Calculator } from "@/pages/Calculator";
import { DecisionEngine } from "@/pages/DecisionEngine";
import { ComparePage, CompareIndex } from "@/pages/ComparePage";
import { BestPage } from "@/pages/BestPage";
import { ModelsPage } from "@/pages/ModelsPage";
import { BestAiTools } from "@/pages/BestAiTools";
import { GuidePage, GuideIndex } from "@/pages/GuidePage";
import { PricingRefreshPage } from "@/pages/admin/PricingRefreshPage";
import { AffiliatesAdminPage } from "@/pages/admin/AffiliatesAdminPage";
import { AffiliateAuditPage } from "@/pages/admin/AffiliateAuditPage";
import { SitemapPreviewPage } from "@/pages/admin/SitemapPreviewPage";
import { AuditRunnerPage } from "@/pages/admin/AuditRunnerPage";
import { Design1 } from "@/pages/Design1";
import { Design2 } from "@/pages/Design2";
import { Design3 } from "@/pages/Design3";
import { PricingPage } from "@/pages/PricingPage";
import { WorthItPage } from "@/pages/WorthItPage";
import { AlternativesPage } from "@/pages/AlternativesPage";
import { ResourcesHub } from "@/pages/ResourcesHub";
import { ChangelogPage } from "@/pages/ChangelogPage";
import { PricingChangelogPage } from "@/pages/PricingChangelogPage";
import { AiTypeIndex } from "@/pages/AiTypeIndex";
import { AiTypePage } from "@/pages/AiTypePage";
import { Terms } from "@/pages/Terms";
import { MediaKit } from "@/pages/MediaKit";
import { Contact } from "@/pages/Contact";
import NotFound from "@/pages/not-found";
import { trackPageView } from "@/utils/ga4";

const queryClient = new QueryClient();

/**
 * SPA page view tracker — fires a GA4 page_view on every wouter route change.
 * Lives inside WouterRouter so useLocation() has access to the router context.
 * send_page_view is disabled in index.html to prevent double-counting.
 */
function PageViewTracker() {
  const [location] = useLocation();
  useEffect(() => {
    trackPageView(location);
  }, [location]);
  return null;
}

function CalculatorRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation("/calculator"); }, [setLocation]);
  return null;
}

function Router() {
  return (
    <>
      <PageViewTracker />
      <Switch>
        <Route path="/admin/pricing-refresh" component={PricingRefreshPage} />
        <Route path="/admin/affiliates" component={AffiliatesAdminPage} />
        <Route path="/admin/affiliate-audit" component={AffiliateAuditPage} />
        <Route path="/admin/sitemap-preview" component={SitemapPreviewPage} />
        <Route path="/admin/audits" component={AuditRunnerPage} />
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
                <Route path="/models" component={ModelsPage} />
                <Route path="/best" component={BestAiTools} />
                <Route path="/best/:slug" component={BestPage} />
                <Route path="/pricing/:slug" component={PricingPage} />
                <Route path="/worth-it/:slug" component={WorthItPage} />
                <Route path="/alternatives/:slug" component={AlternativesPage} />
                <Route path="/calculator/ai-savings-calculator" component={CalculatorRedirect} />
                <Route path="/guides" component={GuideIndex} />
                <Route path="/guides/:slug" component={GuidePage} />
                <Route path="/terms" component={Terms} />
                <Route path="/media-kit" component={MediaKit} />
                <Route path="/contact" component={Contact} />
                <Route component={NotFound} />
              </Switch>
            </Layout>
          )}
        </Route>
      </Switch>
    </>
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
