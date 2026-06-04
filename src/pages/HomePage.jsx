import HomePageDescription from './home/components/HomePageDescription'
import HomePageTitle from './home/components/HomePageTitle'
import './home/HomePage.css'

function HomePage() {
  return (
    <div className="home-page">
      <HomePageTitle />
      <HomePageDescription />
    </div>
  )
}

export default HomePage
