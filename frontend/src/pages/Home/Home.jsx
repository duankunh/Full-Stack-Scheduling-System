import './Home.css';
import ad1Src from '../../assets/advertisement1.png';
import ad2Src from '../../assets/advertisement2.png';

const Home = () => {
  return (
    <main>
      <div className="main_content">
        <div className="main_content_top_section">
          <div className="main_content_top_section_text">
            <h1>Discover And Find Out Best Meet Times</h1>
            <p>The Most Reliable Sheduling Tool in Market</p>
            <div className="main_content_top_section_text_button">
              <button>Tutorial</button>
              <button>Membership</button>
            </div>
          </div>

          <div className="main_content_top_section_advertise">
            <img
              className="main_content_top_section_advertise_img"
              src={ad1Src}
            />
          </div>
        </div>

        <div className="main_content_middle_section">
          <div className="main_content_middle_section_advertise">
            <img
              className="main_content_middle_section_advertise_img"
              src={ad2Src}
            />
          </div>
          <div className="main_content_middle_section_text">
            <p>Mess up with Scheduling?</p>
            <h1>Let</h1>
            <h1>BESTSCHEDULE</h1>
            <h1>Handle Everything</h1>
            <p>Combined with AI tools, BESTSCHEDULE helps users make
              decisions that maximize efficiency and minimize time
              costs. </p>
            <div
              className="main_content_middle_section_text_button">
              <button>VIEW OUR PRICE</button>
            </div>
          </div>
        </div>
      </div>
    </main>
);
}

export default Home;
