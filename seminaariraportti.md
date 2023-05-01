# 1. Johdanto
Tämä projekti on seminaarityö Ohjelmistokehityksen teknologioita kurssille. Aiheena on sääsovellus, joka käyttää OpenWeatherMap API:a hakeakseen ajantasaisia säätilatietoja käyttäjän sijainnin tai syötetyn kaupungin perusteella. Sovellus on toteutettu käyttäen Vue.js:ää, joka on suosittu JavaScript-kehys.

Sovelluksen käyttöliittymä on suunniteltu yksinkertaiseksi ja helppokäyttöiseksi. Kun käyttäjä avaa sovelluksen, se pyytää lupaa käyttää käyttäjän sijaintitietoja, jotta se voi tarjota käyttäjälle ajankohtaiset säätilatiedot hänen sijaintinsa perusteella. Käyttäjä voi myös hakea säätilatietoja manuaalisesti syöttämällä haluamansa sijainnin hakukenttään.

Projektin päätarkoitus oli parantaa omaa ymmärrystäni Vuesta ja laajentaa yleistä tietämystäni web-kehityksestä. Tavoitteenani oli oppia Vuen perusteet ja kehittää kykyäni soveltaa moderneja web-teknologioita käytännön sovelluskehityksessä.

# 2. Käytetyt tekniikat
 - Vue.js
 - Vite
 - TypeScript
 - PrimeVue / PrimeIcons
 - Mitt
 - Luxon

## 2.1 Vue.js
Valitsin Vuen projektiin, sillä se on suosittu ja laajasti käytetty JavaScript-kehys, johon halusin perehtyä. Tarkemmin sanottuna tämä projekti käyttää Vue3:sta ja Vuen Options APIa.

Options API on perinteinen tapa määritellä Vue-komponentti, joka perustuu nimensä mukaisesti options objekteihin. Jokainen komponentti koostuu useista optionseista, kuten data, methods, computed ja lifecycle hooks.

Composition API on uudempi tapa määritellä Vue-komponentteja, joka esiteltiin Vue3:ssa. Se on suunniteltu helpottamaan isojen ja monimutkaisten komponenttien rakentamista. Composition API käyttää funktioita ja hookkeja, jotka palauttavat tarvittavan tilan ja toiminnallisuuden. Tämä mahdollistaa koodin organisoinnin pienempiin palasiin, mikä tekee koodista yleisesti ottaen helpommin hallittavan ja ymmärrettävän.

Vue tiedosto on ns. "Single-File Component", jossa komponentin logiikka (JavaScript / TypeScript), template (HTML) ja tyyli (CSS) määritetään samassa tiedostossa.

Tässä projektissa halusin käyttää Options APIa, sillä se on hieman helpompi oppia ja on yhä käytössä useissa sovelluksissa. Vue-komponentin määrittelyssä voi myös käyttää molempia edellä mainittuja tapoja ja saman sovelluksen komponentit voi määritellä eri metodilla tilanteesta riippuen.

## 2.2 Vite
Uuden Vue sovelluksen alustaminen tapahtuu ``npm init vue@latest`` komennolla, joka luo perustan sovellukselle Viteä käyttäen.

Vite on moderni kehitystyökalu ja kehityspalvelin, joka on suunniteltu nopeaksi ja tehokkaaksi web-sovellusten kehittämistä varten. Se on kehitetty käyttämään uusimpia web-teknologioita, kuten ES modules ja hot module replacement (HMR), joiden avulla kehittäjät voivat nopeasti rakentaa ja testata sovelluksiaan.

## 2.3 TypeScript
Kuten nykyään lähes kaikissa JavaScript-kehyksissä myös Vuessa voi käyttää TypeScriptiä. Olen aikaisemmissa projekteissa jo todennut TypeScriptin hyödylliseksi, joten käytin myös tässä projektissa TypeScriptiä parantamaan tyyppiturvallisuutta ja helpottamaan kehitystä. TypeScript osaamisen laajentaminen oli myös yksi projektin tavoitteistani.

## 2.4 Mitt / Tilanhallinta
Projektin alkuvaiheessa tilanhallinta komponenttien välillä onnistui vielä Vuen omalla $emit metodilla, mutta kun tilaa piti saada muutettua esimerkiksi sisarkomponentissa tai "isovanhemmassa", alkoivat emit-ketjut olemaan jo melko vaikealukuisia. Vuelle löytyy tilanhallintaa varten useampia ratkaisuja kuten VueX tai Pinia. Tässä projektissa hallittavia tiloja on kuitenkin vain muutama, joten päädyin Mittiin.

`Mittin kanssa huomasin yhden ongelman, jonka tilanhallinta kirjasto ratkaisisi. App hakee sijainnin jälkeen aikavyöhykkeen ja emittaa sen DailyForecast ja CurrentWeather komponenteille. Mikäli aikavyöhykkeen haku TimeZoneDB:stä vie enemmän aikaa kuin säätietojen haku komponentit eivät saa aikavyöhyke tietoa, jolloin CurrentWeather renderöidään ilman päivämäärää ja DailyForecast Cardit ei renderöidy ollenkaan. Ajanpuutteen vuoksi tämä jää nyt korjaamatta, mutta on hyvä kehityskohde myöhemmäksi.`

Mitt eroaa edellä mainituista muista ratkaisuista siinä, että se ei ole tilanhallinta kirjasto, vaan event emitter. Muuttuja määritetään normaalisti komponentin data optiossa ja sitä voidaan Mittin avulla muuttaa muualta sovelluksesta emittoimalla sille uusi arvo. VueX ja Pinia tallettavat muuttujien tilat globaaliin "storeen", josta ne Options APIn tapauksessa haettaisiin computed option alle.

Mittin käyttöönotto on nopeaa ja helppoa. TypeScriptiä käytettäessä luodaan tiedosto, jossa Mittillä hoidettavat tilan muutokset tyypitetään ja sen jälkeen vain exportataan emitter. Huomioitavaa on, että Mittissä tyypitetyt tilan muutokset eivät tyypitä itse muuttujaa vaan ainoastaan emitterin välityksellä välitettävän viestin. Käyttöä varten emitter importataan tiedostoon, jossa sitä halutaan hyödyntää. Käyttö onnistuu esimerkiksi seuraavalla tavalla:

#### emitter.ts
```
import mitt from 'mitt'

type Events = {
  loading: boolean;
}

const emitter = mitt<Events>()

export default emitter
```

#### App.vue
```
import emitter from '../emitter';
data() {
  return {
    loading: false,
  }
},
methods: {
  async fetchLocation(
    this.loading = true
    try {
      ...
},
created() {
  emitter.on('loading', e => this.loading = e),
}
```
#### CurrentWeather.vue
```
import emitter from '../emitter';
async fetchWeather() {
  try {
    ...
    emitter.emit('loading', false)
}
```

Muuttuja loading on alustettu falseksi App tiedostossa. Käyttäjän painaessa Search painiketta, kutsuu App fetchLocation funktiota, jossa loadingin arvo muutetaan heti trueksi. Kun CurrentWeather tiedostossa säätiedot on saatu haettua, muutetaan App tiedostossa olevan loadingin tila takaisin falseksi.

## 2.5 PrimeVue ja PrimeIcons
PrimeVue on UI kirjasto, jonka avulla ulkoasusta sai hienomman vähällä työllä. Kirjastosta on tässä projektissa käytössä Card, Button ja InputText komponentit. PrimeVuen alta löytyy myös PrimeIcons, joka tarjoaa monenlaisia ikoneja.

## 2.6 Luxon / Päivämäärät
Halusin saada nykyisen säätilan yhteyteen sen hetkisen kellonajan valitussa kaupungissa, sekä ennusteiden kellonajat kyseisen kaupungin aikaan. OpenWeatherMap API tarjoaa UTC kellonajan Unix muodossa jokaisen ennusteen mukana. API tarjoaa myös timezone-kentän, jossa on Unix muodossa aikavyöhykkeen korjaamiseen tarvittavat sekunnit. Timezone arvojen avulla en kuitenkaan saanut kellonaikoja oikeiksi, luultavasti kesä- ja talviaikojen takia, joten avuksi Luxon kirjaston.

Luxonin avulla Unix kellonaikojen muuntaminen paikallisiin aikoihin vaati kuitenkin aikavyöhykkeen nimen. Aikavyöhykkeiden selvittämiseksi löytyy TimezoneDB API, josta voi hakea koordinaattien perusteella aikavyöhykkeen. Luxonilla ajasta luodaan DateTime olio Unix sekunneista UTC ajassa ja sen jälkeen sille asetetaan haettu aikavyöhyke. Luxon on siitä hieno, että se osaa hoitaa myös kesä- ja talviajat.

OpenWeatherMap API tarjoaa ilmaiseksi vain 3 tunnin väliajoilla olevan ennusteen Tästä syystä 12 tunnin ennusteessa kellonajat harmillisesti muuttuvat eri aikavyöhykkeiden välillä.

# 3. Yhteenveto
