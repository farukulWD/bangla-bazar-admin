import { useEffect } from "react";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useTranslation } from "react-i18next";
import "react-tabs/style/react-tabs.css";
import { Switch, Route, Redirect } from "react-router-dom";

//internal import
import PageTitle from "@/components/Typography/PageTitle";
import AnimatedContent from "@/components/common/AnimatedContent";
import SelectLanguageTwo from "@/components/form/selectOption/SelectLanguageTwo";
import useStoreHomeSubmit from "@/hooks/useStoreHomeSubmit";
import {
  StoreCustomizationContext,
  useStoreCustomization,
} from "@/context/StoreCustomizationContext";
import { getPage, DEFAULT_PAGE } from "@/pages/store-customization/pagesConfig";

const BASE = "/store/customization";

// Renders one page. Single-section pages render the original store-home
// component inside a form; multi-section pages (custom) manage their own chrome.
const CustomizationPageView = ({ pageKey }) => {
  const store = useStoreCustomization();
  const { Component, custom } = getPage(pageKey);

  if (custom) return <Component {...store} />;

  return (
    <AnimatedContent>
      <div className="sm:container w-full md:p-6 p-4 mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg">
        <form onSubmit={store.handleSubmit(store.onSubmit)}>
          <Component {...store} />
        </form>
      </div>
    </AnimatedContent>
  );
};

const StoreCustomization = () => {
  const { t } = useTranslation();

  // ONE shared form + monolithic save instance for every page and section-tab.
  const store = useStoreHomeSubmit();
  const {
    register,
    handleSelectLanguage,
    isCoupon,
    setIsSliderFullWidth,
    leftRightArrow,
    setBottomDots,
    setBothSliderOption,
    bottomDots,
    setLeftRightArrow,
    bothSliderOption,
  } = store;

  // Coupling rules preserved from the original StoreHome page so they run
  // regardless of which page/section is active.
  useEffect(() => {
    isCoupon && setIsSliderFullWidth(false);
  }, [isCoupon, setIsSliderFullWidth]);

  useEffect(() => {
    leftRightArrow && setBottomDots(false);
  }, [leftRightArrow, setBottomDots]);

  useEffect(() => {
    leftRightArrow && setBothSliderOption(false);
  }, [leftRightArrow, setBothSliderOption]);

  useEffect(() => {
    bottomDots && setBothSliderOption(false);
  }, [bottomDots, setBothSliderOption]);

  useEffect(() => {
    bottomDots && setLeftRightArrow(false);
  }, [bottomDots, setLeftRightArrow]);

  useEffect(() => {
    bothSliderOption && setLeftRightArrow(false);
  }, [bothSliderOption, setLeftRightArrow]);

  useEffect(() => {
    bothSliderOption && setBottomDots(false);
  }, [bothSliderOption, setBottomDots]);

  return (
    <StoreCustomizationContext.Provider value={store}>
      <div className="flex justify-between text-center items-center">
        <div>
          <PageTitle>{t("StoreCustomizationPageTitle")}</PageTitle>
        </div>
        <div className="pb-4">
          <SelectLanguageTwo
            register={register}
            handleSelectLanguage={handleSelectLanguage}
          />
        </div>
      </div>

      <Switch>
        <Route exact path={BASE}>
          <Redirect to={`${BASE}/${DEFAULT_PAGE}`} />
        </Route>
        <Route
          path={`${BASE}/:page`}
          render={({ match }) => (
            <CustomizationPageView pageKey={match.params.page} />
          )}
        />
      </Switch>
    </StoreCustomizationContext.Provider>
  );
};

export default StoreCustomization;
