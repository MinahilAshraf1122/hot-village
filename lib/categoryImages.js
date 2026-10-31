// Category photos for menu cards.
// If a menu item has its own image_url (set in the database), that wins.
// Otherwise the item's category photo is used, so every card has a picture.
export const CATEGORY_IMAGES = {
  "Chicken Karahi":
    "https://images.pexels.com/photos/31692606/pexels-photo-31692606/free-photo-of-spicy-curry-chicken-cooking-in-a-frying-pan.jpeg?auto=compress&w=1260&h=750&dpr=1",
  "Mutton Karahi":
    "https://images.pexels.com/photos/28674565/pexels-photo-28674565/free-photo-of-authentic-indian-mutton-curry-in-traditional-pan.jpeg?auto=compress&w=1260&h=750&dpr=1",
  "Beef Karahi":
    "https://images.pexels.com/photos/29684989/pexels-photo-29684989/free-photo-of-delicious-indian-mutton-curry-in-traditional-pan.jpeg?auto=compress&w=1260&h=750&dpr=1",
  "Chicken Handi":
    "https://images.pexels.com/photos/20408448/pexels-photo-20408448/free-photo-of-photo-of-a-curry-dish-served-in-a-pan.jpeg?auto=compress&w=1260&h=750&dpr=1",
  Pakistani:
    "https://images.pexels.com/photos/29148133/pexels-photo-29148133/free-photo-of-traditional-indian-thali-meal-with-naan-bread.jpeg?auto=compress&w=1260&h=750&dpr=1",
  "Fast Food":
    "https://images.pexels.com/photos/7478996/pexels-photo-7478996.jpeg?auto=compress&w=1260&h=750&dpr=1",
  Pizza:
    "https://images.pexels.com/photos/11485286/pexels-photo-11485286.jpeg?auto=compress&w=1260&h=750&dpr=1",
  "Bar-B-Q":
    "https://images.pexels.com/photos/29358857/pexels-photo-29358857/free-photo-of-delicious-grilled-kebab-on-skewers-with-coals.jpeg?auto=compress&w=1260&h=750&dpr=1",
  Tandoori:
    "https://images.pexels.com/photos/32965430/pexels-photo-32965430/free-photo-of-freshly-baked-flatbreads-with-sesame-and-nigella-seeds.jpeg?auto=compress&w=1260&h=750&dpr=1",
  "Drinks & Extras":
    "https://images.pexels.com/photos/8879621/pexels-photo-8879621.jpeg?auto=compress&w=1260&h=750&dpr=1",
  Deals:
    "https://images.pexels.com/photos/29850004/pexels-photo-29850004/free-photo-of-authentic-indian-feast-with-rich-flavors.jpeg?auto=compress&w=1260&h=750&dpr=1",
};

// Big photo shown in the homepage hero band.
export const HERO_IMAGE =
  "https://images.pexels.com/photos/20408464/pexels-photo-20408464/free-photo-of-pot-of-soup.jpeg?auto=compress&w=1260&h=750&dpr=1";

const FALLBACK_IMAGE = CATEGORY_IMAGES["Deals"];

export function imageFor(item) {
  if (item && item.image_url) return item.image_url;
  if (item && CATEGORY_IMAGES[item.category]) return CATEGORY_IMAGES[item.category];
  return FALLBACK_IMAGE;
}
