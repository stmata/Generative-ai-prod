import { Element } from 'react-scroll';
import Navbar from '../Navbar/Navbar';
import Features from '../Features/Features';
import HowItWorks from '../HowItWorks/HowItWorks';
import Technology from '../Technology/Technology';

const Home = () => {
  return (
    <div>
      <Navbar />
      <Element name="features">
        <Features />
      </Element>
      <Element name="howItWorks">
        <HowItWorks />
      </Element>
      <Element name="technologies">
        <Technology />
      </Element>
    </div>
  );
};

export default Home;
