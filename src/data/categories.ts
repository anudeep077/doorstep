// Quick-pick dish categories shown above the search bar. `query` is what
// gets typed into search when tapped, so a chip is exactly a saved search.
//
// Photos are hotlinked thumbnails from Wikimedia Commons (free licences;
// the `credit` link is each file page with author + licence). `emoji` is
// the fallback if an image ever fails to load.
export type DishCategory = { label: string; query: string; image_url: string; credit: string; emoji: string };

export const DISH_CATEGORIES: DishCategory[] = [
  { label: "Biryani", query: "biryani", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Chicken_Biryani_from_the_streets_of_Hyderabad.JPG/330px-Chicken_Biryani_from_the_streets_of_Hyderabad.JPG", credit: "https://commons.wikimedia.org/wiki/File:Chicken_Biryani_from_the_streets_of_Hyderabad.JPG", emoji: "🍛" },
  { label: "Pizza", query: "pizza", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/All_Good_pizza_%2838501728345%29.jpg/330px-All_Good_pizza_%2838501728345%29.jpg", credit: "https://commons.wikimedia.org/wiki/File:All_Good_pizza_(38501728345).jpg", emoji: "🍕" },
  { label: "Dosa", query: "dosa", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Masala_dosa_01.jpg/330px-Masala_dosa_01.jpg", credit: "https://commons.wikimedia.org/wiki/File:Masala_dosa_01.jpg", emoji: "🥞" },
  { label: "Burgers", query: "burger", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Cheeseburger.jpg/330px-Cheeseburger.jpg", credit: "https://commons.wikimedia.org/wiki/File:Cheeseburger.jpg", emoji: "🍔" },
  { label: "Momos", query: "momos", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Buff_Momos.jpg/330px-Buff_Momos.jpg", credit: "https://commons.wikimedia.org/wiki/File:Buff_Momos.jpg", emoji: "🥟" },
  { label: "Thali", query: "thali", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Indian_Thali_2.jpg/330px-Indian_Thali_2.jpg", credit: "https://commons.wikimedia.org/wiki/File:Indian_Thali_2.jpg", emoji: "🍽️" },
  { label: "Chaat", query: "chaat", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Crispy_Pani_Puri.jpg/330px-Crispy_Pani_Puri.jpg", credit: "https://commons.wikimedia.org/wiki/File:Crispy_Pani_Puri.jpg", emoji: "🫓" },
  { label: "Noodles", query: "noodles", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Tasty_hakka_noodles_image.jpg/330px-Tasty_hakka_noodles_image.jpg", credit: "https://commons.wikimedia.org/wiki/File:Tasty_hakka_noodles_image.jpg", emoji: "🍜" },
  { label: "Kebabs", query: "kebab", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7e/Seekh_Kebab.JPG/330px-Seekh_Kebab.JPG", credit: "https://commons.wikimedia.org/wiki/File:Seekh_Kebab.JPG", emoji: "🍢" },
  { label: "Desserts", query: "cake", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Chocolate_Cake_Slice_in_bin_%2832180558890%29.jpg/330px-Chocolate_Cake_Slice_in_bin_%2832180558890%29.jpg", credit: "https://commons.wikimedia.org/wiki/File:Chocolate_Cake_Slice_in_bin_(32180558890).jpg", emoji: "🍰" },
  { label: "Paratha", query: "paratha", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/Aloo_Paratha_North_Indian.jpg/330px-Aloo_Paratha_North_Indian.jpg", credit: "https://commons.wikimedia.org/wiki/File:Aloo_Paratha_North_Indian.jpg", emoji: "🫓" },
  { label: "Sushi", query: "sushi", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Sushi_platter.jpg/330px-Sushi_platter.jpg", credit: "https://commons.wikimedia.org/wiki/File:Sushi_platter.jpg", emoji: "🍣" },
  { label: "Tacos", query: "taco", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Tacos_al_pastor%2C_taco_de_panza.jpg/330px-Tacos_al_pastor%2C_taco_de_panza.jpg", credit: "https://commons.wikimedia.org/wiki/File:Tacos_al_pastor,_taco_de_panza.jpg", emoji: "🌮" },
  { label: "Salads", query: "salad", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b7/Plant-fruit-bowl-dish-food-salad-1200225-pxhere.jpg/330px-Plant-fruit-bowl-dish-food-salad-1200225-pxhere.jpg", credit: "https://commons.wikimedia.org/wiki/File:Plant-fruit-bowl-dish-food-salad-1200225-pxhere.jpg", emoji: "🥗" },
];
