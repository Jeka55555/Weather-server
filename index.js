import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";


const typeDefs = gql`
type Weather {
  temperature: Float       
  feels_like: Float   
  temp_min: Float       
  temp_max: Float   
  pressure: Int            
  humidity: Int            
  wind_speed: Float        
  wind_deg: Int          
  clouds: Int            
  main: String      
  icon: String           
  city: String         
  country: String        
  sunrise: Int            
  sunset: Int              
  timezone: Int         
  visibility: Int
}

type WeatherForecast {
  dt: Int
  dt_txt: String
  temperature: Float
  feels_like: Float
  temp_min: Float
  temp_max: Float
  temp_kf: Float
  pressure: Int
  sea_level: Int
  grnd_level: Int
  humidity: Int
  wind_speed: Float
  wind_deg: Int
  wind_gust: Float
  clouds: Int
  visibility: Int
  pop: Float
  pod: String
  weather: WeatherCondition
}

type WeatherCondition {
  id: Int
  main: String
  description: String
  icon: String
}

type ForecastResponse {
  cod: String
  message: Int
  cnt: Int
  city: CityInfo
  list: [WeatherForecast]
}

type CityInfo {
  id: Int
  name: String
  coord: Coordinates
  country: String
  population: Int
  timezone: Int
  sunrise: Int
  sunset: Int
}

type Coordinates {
  lat: Float
  lon: Float
}

  type Query {
    weather(city: String!): Weather
    weatherForecast(city: String!): ForecastResponse
  }
`;


const resolvers = {
    Query: {
        weather: async (_, { city }) => {
            const apiKey = "d457c0518b39fb46093c5b6d41796ac0";
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
            );
            const data = await res.json();

            if (data.cod !== 200) {
                throw new Error(data.message || "Ошибка запроса к OpenWeatherMap");
            }

            return {
                temperature: data.main.temp,
                feels_like: data.main.feels_like,
                temp_min: data.main.temp_min,
                temp_max: data.main.temp_max,
                pressure: data.main.pressure,
                humidity: data.main.humidity,
                wind_speed: data.wind.speed,
                wind_deg: data.wind.deg,
                clouds: data.clouds.all,
                main: data.weather[0].main,
                icon: data.weather[0].icon,
                city: data.name,
                country: data.sys.country,
                sunrise: data.sys.sunrise,
                sunset: data.sys.sunset,
                timezone: data.timezone,
                visibility: data.visibility
            };
        },
        weatherForecast: async (_, { city }) => {
            const apiKey = "d457c0518b39fb46093c5b6d41796ac0";
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
            );
            const data = await res.json();

            if (data.cod !== "200") {
                throw new Error(data.message || "Ошибка запроса к OpenWeatherMap");
            }

            return {
                cod: data.cod,
                message: data.message,
                cnt: data.cnt,
                city: {
                    id: data.city.id,
                    name: data.city.name,
                    coord: {
                        lat: data.city.coord.lat,
                        lon: data.city.coord.lon
                    },
                    country: data.city.country,
                    population: data.city.population || 0,
                    timezone: data.city.timezone,
                    sunrise: data.city.sunrise,
                    sunset: data.city.sunset
                },
                list: data.list.map((item) => ({
                    dt: item.dt,
                    dt_txt: item.dt_txt,
                    temperature: item.main.temp,
                    feels_like: item.main.feels_like,
                    temp_min: item.main.temp_min,
                    temp_max: item.main.temp_max,
                    temp_kf: item.main.temp_kf,
                    pressure: item.main.pressure,
                    sea_level: item.main.sea_level,
                    grnd_level: item.main.grnd_level,
                    humidity: item.main.humidity,
                    wind_speed: item.wind?.speed || 0,
                    wind_deg: item.wind?.deg || 0,
                    wind_gust: item.wind?.gust || 0,
                    clouds: item.clouds.all,
                    visibility: item.visibility || 0,
                    pop: item.pop || 0,
                    pod: item.sys.pod,
                    weather: {
                        id: item.weather[0].id,
                        main: item.weather[0].main,
                        description: item.weather[0].description,
                        icon: item.weather[0].icon
                    }
                }))
            };
        },
    },
};


const server = new ApolloServer({
    typeDefs,
    resolvers,
});


server.listen({ port: 4000, host: '0.0.0.0' }).then(({ url }) => {
    console.log(`🚀 GraphQL сервер запущен по адресу: ${url}`);
    console.log(`📱 Доступен для подключения с любого устройства в сети`);
});
