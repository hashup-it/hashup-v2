import { BigNumber } from "ethers";

interface Cartridge {
  name: string;
  symbol: string;
  metadata: string;
  supply: BigNumber;
  fee: number;
}

export const DEFAULT_GRAY_CARTRIDGE: Cartridge = {
  name: "Gray Cartridge",
  symbol: "GRC",
  metadata: "gray-metadata-url",
  supply: BigNumber.from(1000000000),
  fee: 200,
};

export const DEFAULT_GOLD_CARTRIDGE: Cartridge = {
  name: "Gold Cartridge",
  symbol: "GOC",
  metadata: "gold-metadata-url",
  supply: BigNumber.from(13370000),
  fee: 200,
};

export const DEFAULT_CUSTOM_CARTRIDGE: Cartridge = {
  name: "Custom Cartridge",
  symbol: "CSC",
  metadata: "custom-metadata-url",
  supply: BigNumber.from(10000000000),
  fee: 200,
};

interface GameProfileInterface {
  adress: string; //  adres licencji na blockchainie
  name: string; // Nazwa gry
  symbol: string; // Symbol gry
  links: {
	socials: [] /// wyciagnij po prostu z metadata cała tablice i bedzie git działać,
	website: "https:///blabla"
  },
  media: {
	  cover: string // Adres covera gry czyli tego 16:9,
	  banner: string // 3:4 obrazek,
	  icon: string // to co sie w metamasku pokazuje 
	  screenshots: ["screen1.jpg", "screen2.png", "screen3.png"],
	  video: string // adres filmiku yt
  },
  description: string,
  tags: ["indie", "rpg"] // skopiuj obiekt z metadata,
  platforms: ["pc", "macos"] // skopiuj obiekt z metadata
  transferFee: string, // uwzglednilem decimalsy do 1 miejsca po przecinku w kontrakcie wiec 20.5% fee to na blockchainie 205, 
  //imo mozesz to dzielić przez 10 i zwracać dla np 193 na blockchainie przez api 19.3 po prostu
  marketplaceFee: string, // jeszcze nie ma ale bedzie w nowym kontrakcie
  totalSupply: number,
  price: number,
  releaseDate: string,
  creator: string //adres tworcy
  licenseType: string //gold, gray, custom,
}
