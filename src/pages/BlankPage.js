// filepath: /d:/WineCeller/wineseller_website_frontend/src/pages/BlankPage/BlankPage.js
import './BlankPage.css';
import React from 'react';
import { motion } from 'framer-motion';

const underlineVariants = {
  initial: { width: 0 },
  hover: { width: '100%' },
};

const categories = ['Category1', 'Category2', 'Category3', 'Category4'];

const BlankPage = () => {
  return (
    <div>
      <div className="category-tabs">
        {categories.map((category) => (
          <motion.button
            key={category}
            className="category-tab"
            whileHover="hover"
            initial="initial"
          >
            {category}
            <motion.div
              className="underline"
              variants={underlineVariants}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default BlankPage;

