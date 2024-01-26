import { useState, useEffect } from 'react';
import Head from 'next/head';
import ImageBox from '@/components/ImageBox/Index.jsx'
import ImageDemo from '@/components/ImageBox/demo'
import TopNav from '@/components/TopNav'
import style from "./index.module.scss";
import Link from 'next/link';

const Homepage = () => {
  const [imageJson, setImageJson] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('https://raw.githubusercontent.com/heurist-network/heurist-models/main/models.json');
      const json = await res.json();
      const filtered = json.filter((item) => item.type === 'sd15');
      setImageJson(filtered);
    };

    fetchData();
  }, []);

  return (
    <>
      <Head>
        <title>Imagine | FREE Image generator by Heurist</title>
      </Head>
      <main className={style.root}>
        <TopNav />
        <div className='content'>
          <div className="welcome_text">Welcome to <span>Imagine</span> powered by <span>Heurist</span></div>
          <h1>
            We host best Stable Diffusion models on <br></br><span style={{ color: '#C57CFF' }}>a decentralized network of GPUs</span>.
          </h1>
          <p className='text'>
            <span> Call for model creators: </span> Want to get your models listed and earn HUE token rewards? Contact <Link href='mailto:team@heurist.xyz' target="_blank">team@heurist.xyz</Link>
          </p>
          {imageJson && <ImageBox imageJson={imageJson} />}
        </div>
        {/* <ImageDemo /> */}
      </main >
    </>
  )
}

export default Homepage;