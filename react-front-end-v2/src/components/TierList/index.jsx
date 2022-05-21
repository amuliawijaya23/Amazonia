import HorizontalTabs from "./HorizontalTabs";
import ImageSubmitForm from './ImageSubmitForm';
import BackupRoundedIcon from '@mui/icons-material/BackupRounded';

import useVisualMode from "../../hooks/useVisualMode";

import {HIDDEN, SHOW} from '../../helper/modes';

export default function TierList(props) {

  const {mode, transition, back} = useVisualMode(HIDDEN);

  const sortProducts = (products) => {
    return products.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
  };

  const toggleImageForm = () => {
    mode === HIDDEN ? transition(SHOW) : back();
  };

  const getCategoryName = () => {
    if (props.category) {
      if (props.childCategory) return props.childCategories.find(category => category.id === props.childCategory)?.name;
      return props.categories.find(category => category.id === props.category).name;
    }
    return 'CATEGORY';
  };

  return (
    <div className="tier-list">
      <header>
        {getCategoryName()}
      </header>
      <section className="tier-list-body">
        <div className="tier-list-item">
          <HorizontalTabs
            products={sortProducts(props.products.slice(0, (props.products.length) / 6))}
            user={props.user}
            addWish={props.addWish}
            wishes={props.wishes}
            getReviewByAsin={props.getReviewByAsin}            
          />
        </div>
        <div className="tier-list-item">
          <HorizontalTabs
            products={sortProducts(props.products.slice((props.products.length) / 6, (props.products.length) / 6 * 2))}
            user={props.user}
            addWish={props.addWish}
            wishes={props.wishes}
            getReviewByAsin={props.getReviewByAsin}            
          />      
        </div>
        <div className="tier-list-item">
          <HorizontalTabs
            products={sortProducts(props.products.slice((props.products.length) / 6 * 2, (props.products.length) / 6 * 3))}
            user={props.user}
            addWish={props.addWish}
            wishes={props.wishes}
            getReviewByAsin={props.getReviewByAsin}            
          />
        </div>
        <div className="tier-list-item">
          <HorizontalTabs
            products={sortProducts(props.products.slice((props.products.length) / 6 * 3, (props.products.length) / 6 * 4))}
            user={props.user}
            addWish={props.addWish}
            wishes={props.wishes}
            getReviewByAsin={props.getReviewByAsin}            
          />
        </div>
        <div className="tier-list-item">
          <HorizontalTabs
            products={sortProducts(props.products.slice((props.products.length) / 6 * 4, (props.products.length) / 6 * 5))}
            user={props.user}
            addWish={props.addWish}
            wishes={props.wishes}
            getReviewByAsin={props.getReviewByAsin}            
          />
        </div>
        <div className="tier-list-item">
          <HorizontalTabs
            products={sortProducts(props.products.slice((props.products.length) / 6 * 5, -1))}
            user={props.user}
            addWish={props.addWish}
            wishes={props.wishes}
            getReviewByAsin={props.getReviewByAsin}            
          />
        </div>
      </section>
      <footer className="tier-list-footer">
        {mode === HIDDEN && <BackupRoundedIcon 
          onClick={() => toggleImageForm()}
        />}
        {mode === SHOW && <ImageSubmitForm
          onClick={() => toggleImageForm()}
          getProductsByImageLabel={props.getProductsByImageLabel}
        />}
      </footer>
    </div>
  );
};