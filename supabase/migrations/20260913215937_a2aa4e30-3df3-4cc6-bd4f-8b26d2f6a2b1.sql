CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(10,2) CHECK (compare_at_price >= 0),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  collection TEXT,
  material TEXT,
  color TEXT,
  dimensions TEXT,
  weight_kg NUMERIC(8,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','archived','out_of_stock')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_bestseller BOOLEAN NOT NULL DEFAULT false,
  is_new_arrival BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(name,'') || ' ' || coalesce(material,'') || ' ' || coalesce(color,'') || ' ' ||
      coalesce(collection,'') || ' ' || coalesce(short_description,'') || ' ' || coalesce(description,''))
  ) STORED
);

CREATE INDEX products_category_idx ON public.products (category_id);
CREATE INDEX products_status_idx ON public.products (status);
CREATE INDEX products_price_idx ON public.products (price);
CREATE INDEX products_created_idx ON public.products (created_at DESC);
CREATE INDEX products_search_idx ON public.products USING GIN (search_vector);

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active categories are publicly viewable"
  ON public.categories FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Published products are publicly viewable"
  ON public.products FOR SELECT TO anon, authenticated USING (status IN ('active','out_of_stock'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.categories (slug, name, description, image_url, sort_order) VALUES
  ('sofas','Sofas','Deep-seated sofas in linen, boucle and full-grain leather.','/images/products/halden-sofa.jpg',1),
  ('beds','Beds','Upholstered and solid-oak beds built for quiet nights.','/images/products/sereno-bed.jpg',2),
  ('dining-tables','Dining Tables','Solid timber and stone tables made for long dinners.','/images/products/otto-dining-table.jpg',3),
  ('dining-chairs','Dining Chairs','Sculptural seating that finishes the table.','/images/products/mira-chair.jpg',4),
  ('coffee-tables','Coffee Tables','Centrepieces in oak, travertine and marble.','/images/products/nord-coffee-table.jpg',5),
  ('tv-units','TV Units','Low-slung media consoles with concealed storage.','/images/products/vale-console.jpg',6),
  ('wardrobes','Wardrobes','Generous storage with a tailored finish.','/images/products/copenhagen-wardrobe.jpg',7),
  ('office-furniture','Office Furniture','Desks, chairs and shelving for considered work.','/images/products/atelier-desk.jpg',8),
  ('outdoor-furniture','Outdoor Furniture','Weather-ready teak and rope for terraces and gardens.','/images/products/riviera-outdoor-sofa.jpg',9),
  ('home-decor','Home Decor','Lighting, ceramics and objects that complete a room.','/images/products/halo-lamp.jpg',10);

INSERT INTO public.products
  (slug, name, sku, short_description, description, price, compare_at_price, category_id, collection, material, color, dimensions, weight_kg, stock_quantity, is_featured, is_bestseller, is_new_arrival, rating, reviews_count, images)
VALUES
  ('halden-three-seat-sofa','Halden Three-Seat Sofa','SLVX-SOF-001','Deep feather-blend seating in stone linen.','A generous three-seat silhouette with feather-blend cushioning, a kiln-dried hardwood frame and hand-finished solid oak legs. Upholstered in a heavyweight stone linen that softens beautifully with use.',2480.00,2890.00,(SELECT id FROM public.categories WHERE slug='sofas'),'Halden','Stone linen, kiln-dried hardwood, solid oak','Stone','230 × 96 × 78 cm',68.00,12,true,true,false,4.8,126,ARRAY['/images/products/halden-sofa.jpg']),
  ('marlowe-curved-sofa','Marlowe Curved Sofa','SLVX-SOF-002','A sculptural curve in ivory boucle.','A softly curved four-seat sofa in dense ivory boucle. The continuous back rail is hand-shaped, and the low plinth base keeps the volume grounded and calm.',3290.00,NULL,(SELECT id FROM public.categories WHERE slug='sofas'),'Marlowe','Ivory boucle, birch ply, steel','Ivory','262 × 98 × 74 cm',82.00,6,true,false,true,4.9,58,ARRAY['/images/products/marlowe-sofa.jpg']),
  ('aster-lounge-chair','Aster Lounge Chair','SLVX-SOF-003','Full-grain leather with a walnut frame.','A reading chair in aniline-dyed full-grain leather over a solid walnut frame, with a gently reclined back and hand-stitched seams that patinate with age.',1180.00,1390.00,(SELECT id FROM public.categories WHERE slug='sofas'),'Aster','Full-grain leather, solid walnut','Cognac','78 × 84 × 82 cm',24.00,3,false,true,false,4.7,91,ARRAY['/images/products/aster-chair.jpg']),
  ('nord-oak-coffee-table','Nord Oak Coffee Table','SLVX-CTB-001','Solid white oak with a soft matte oil.','A rectangular coffee table in solid white oak, finished with a plant-based matte oil that lets the grain read clearly. Chamfered edges and a floating lower shelf.',890.00,NULL,(SELECT id FROM public.categories WHERE slug='coffee-tables'),'Nord','Solid white oak','Natural oak','130 × 70 × 38 cm',32.00,18,true,true,false,4.6,74,ARRAY['/images/products/nord-coffee-table.jpg']),
  ('elin-marble-coffee-table','Elin Marble Coffee Table','SLVX-CTB-002','Honed Carrara marble on a blackened base.','A honed Carrara marble top with a natural veining pattern unique to each piece, carried on a blackened steel base with a hand-brushed finish.',1340.00,1590.00,(SELECT id FROM public.categories WHERE slug='coffee-tables'),'Elin','Carrara marble, blackened steel','White marble','110 × 110 × 34 cm',54.00,7,false,false,true,4.8,39,ARRAY['/images/products/elin-coffee-table.jpg']),
  ('vale-media-console','Vale Media Console','SLVX-TVU-001','Fluted oak doors with cable management.','A low media console with fluted solid oak doors, soft-close hinges, integrated cable routing and a ventilated rear panel for equipment.',1120.00,NULL,(SELECT id FROM public.categories WHERE slug='tv-units'),'Vale','Solid oak, oak veneer, brass','Natural oak','180 × 42 × 48 cm',46.00,10,false,true,false,4.5,52,ARRAY['/images/products/vale-console.jpg']),
  ('sereno-upholstered-bed','Sereno Upholstered Bed','SLVX-BED-001','A tall channel-stitched headboard in warm beige.','A king bed with a tall channel-stitched headboard in warm beige wool blend, a slatted hardwood base and tapered solid oak feet. No box spring required.',2190.00,2490.00,(SELECT id FROM public.categories WHERE slug='beds'),'Sereno','Wool blend, hardwood, solid oak','Warm beige','198 × 215 × 122 cm',74.00,9,true,true,false,4.9,148,ARRAY['/images/products/sereno-bed.jpg']),
  ('linnea-oak-bed','Linnea Oak Bed','SLVX-BED-002','Solid oak, joinery-first construction.','A pared-back solid oak bed frame assembled with exposed dowel joinery and a low profile headboard. Finished in a hard-wax oil for everyday durability.',1780.00,NULL,(SELECT id FROM public.categories WHERE slug='beds'),'Linnea','Solid European oak','Natural oak','196 × 212 × 96 cm',66.00,4,false,false,true,4.7,63,ARRAY['/images/products/linnea-bed.jpg']),
  ('aurelia-nightstand','Aurelia Nightstand','SLVX-BED-003','Two drawers, brass pulls, oak carcass.','A compact nightstand with two soft-close drawers, solid oak carcass and slim solid brass pulls that develop a living patina.',540.00,NULL,(SELECT id FROM public.categories WHERE slug='beds'),'Aurelia','Solid oak, brass','Natural oak','48 × 40 × 56 cm',14.00,22,false,true,false,4.6,87,ARRAY['/images/products/aurelia-nightstand.jpg']),
  ('copenhagen-wardrobe','Copenhagen Wardrobe','SLVX-WRD-001','Three doors, interior drawers and rail.','A three-door wardrobe with full-height hanging rail, four interior drawers, adjustable shelving and hand-finished oak fronts on soft-close hinges.',2960.00,3380.00,(SELECT id FROM public.categories WHERE slug='wardrobes'),'Copenhagen','Solid oak, oak veneer','Natural oak','180 × 62 × 210 cm',132.00,5,true,false,false,4.7,41,ARRAY['/images/products/copenhagen-wardrobe.jpg']),
  ('otto-oak-dining-table','Otto Oak Dining Table','SLVX-DTB-001','Seats eight on a solid oak plank top.','A substantial dining table with a 4 cm solid oak plank top, breadboard ends and twin trestle legs joined by a through-tenon stretcher.',2640.00,NULL,(SELECT id FROM public.categories WHERE slug='dining-tables'),'Otto','Solid European oak','Natural oak','240 × 100 × 75 cm',96.00,8,true,true,false,4.9,112,ARRAY['/images/products/otto-dining-table.jpg']),
  ('ravello-marble-dining-table','Ravello Marble Dining Table','SLVX-DTB-002','Travertine top on a sculpted plinth.','A round travertine dining table on a sculpted plinth base, honed and sealed for daily use. Each top is cut from a single block.',3480.00,3960.00,(SELECT id FROM public.categories WHERE slug='dining-tables'),'Ravello','Travertine','Cream stone','Ø 140 × 75 cm',148.00,2,false,false,true,4.8,27,ARRAY['/images/products/ravello-dining-table.jpg']),
  ('mira-dining-chair','Mira Dining Chair','SLVX-DCH-001','Curved oak back with a woven cane seat.','A dining chair with a steam-bent oak back, hand-woven natural cane seat and a lightly padded cushion pad. Sold individually.',420.00,NULL,(SELECT id FROM public.categories WHERE slug='dining-chairs'),'Mira','Steam-bent oak, natural cane','Natural oak','48 × 52 × 80 cm',6.00,40,true,true,false,4.7,203,ARRAY['/images/products/mira-chair.jpg']),
  ('bram-bar-stool','Bram Bar Stool','SLVX-DCH-002','Leather saddle seat, walnut legs.','A counter-height stool with a saddle-shaped leather seat, solid walnut legs and a brass footrest detail.',390.00,460.00,(SELECT id FROM public.categories WHERE slug='dining-chairs'),'Bram','Leather, solid walnut, brass','Tan','42 × 42 × 74 cm',7.00,16,false,false,false,4.5,64,ARRAY['/images/products/bram-stool.jpg']),
  ('atelier-writing-desk','Atelier Writing Desk','SLVX-OFF-001','Oak surface with a concealed drawer.','A writing desk with a solid oak surface, a full-width concealed drawer, cable pass-through and a slim powder-coated steel frame.',1240.00,NULL,(SELECT id FROM public.categories WHERE slug='office-furniture'),'Atelier','Solid oak, powder-coated steel','Natural oak / charcoal','150 × 70 × 74 cm',38.00,11,true,false,true,4.6,45,ARRAY['/images/products/atelier-desk.jpg']),
  ('kestrel-office-chair','Kestrel Office Chair','SLVX-OFF-002','Leather and aluminium, fully adjustable.','A task chair in full-grain leather with a polished aluminium base, adjustable lumbar support, seat depth and height. Rated for full working days.',980.00,1180.00,(SELECT id FROM public.categories WHERE slug='office-furniture'),'Kestrel','Full-grain leather, aluminium','Charcoal','66 × 66 × 108 cm',18.00,14,false,true,false,4.7,98,ARRAY['/images/products/kestrel-chair.jpg']),
  ('sloane-bookshelf','Sloane Bookshelf','SLVX-OFF-003','Five open shelves in solid ash.','An open bookshelf in solid ash with five adjustable shelves and a blackened steel back brace for stability against the wall.',860.00,NULL,(SELECT id FROM public.categories WHERE slug='office-furniture'),'Sloane','Solid ash, blackened steel','Pale ash','90 × 34 × 190 cm',42.00,9,false,false,false,4.5,36,ARRAY['/images/products/sloane-bookshelf.jpg']),
  ('riviera-outdoor-sofa','Riviera Outdoor Sofa','SLVX-OUT-001','FSC teak with quick-dry cushions.','A three-seat outdoor sofa in FSC-certified teak with quick-dry foam cushions and solution-dyed acrylic covers that resist fading and moisture.',2280.00,2680.00,(SELECT id FROM public.categories WHERE slug='outdoor-furniture'),'Riviera','FSC teak, solution-dyed acrylic','Teak / sand','214 × 88 × 72 cm',58.00,6,true,false,false,4.6,33,ARRAY['/images/products/riviera-outdoor-sofa.jpg']),
  ('lido-teak-dining-set','Lido Teak Dining Set','SLVX-OUT-002','Table and four chairs in solid teak.','An outdoor dining set comprising a solid teak table and four stacking chairs, left untreated to weather to a silver-grey patina.',3140.00,NULL,(SELECT id FROM public.categories WHERE slug='outdoor-furniture'),'Lido','Solid teak','Teak','180 × 90 × 74 cm',88.00,3,false,false,true,4.7,21,ARRAY['/images/products/lido-teak-dining-set.jpg']),
  ('onda-ceramic-vase-set','Onda Ceramic Vase Set','SLVX-DEC-001','Three hand-thrown stoneware vases.','A set of three hand-thrown stoneware vases in a matte oatmeal glaze. Small variations in form and tone are intrinsic to the process.',180.00,220.00,(SELECT id FROM public.categories WHERE slug='home-decor'),'Onda','Stoneware','Oatmeal','Tallest 34 cm',4.00,34,false,true,false,4.4,57,ARRAY['/images/products/onda-vase.jpg']),
  ('halo-floor-lamp','Halo Floor Lamp','SLVX-DEC-002','Linen shade on an antique brass stem.','A floor lamp with a hand-rolled linen shade, solid antique brass stem and a weighted marble base. Dimmable, bulb included.',620.00,NULL,(SELECT id FROM public.categories WHERE slug='home-decor'),'Halo','Linen, antique brass, marble','Brass / ivory','40 × 40 × 160 cm',9.00,13,true,false,true,4.8,72,ARRAY['/images/products/halo-lamp.jpg']);