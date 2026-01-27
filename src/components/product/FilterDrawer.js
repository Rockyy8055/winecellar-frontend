import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { QUANTITY_SIZE_OPTIONS } from '../../helpers/product';

const PRICE_SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'priceLowToHigh', label: 'Price: Low to High' },
  { value: 'priceHighToLow', label: 'Price: High to Low' },
];

const FilterDrawer = ({
  open,
  onClose,
  onApply,
  onClear,
  categories = [],
  selectedCategories = [],
  selectedSizes = [],
  selectedSort = 'default',
  multiCategory = true,
  title = 'Filters',
}) => {
  const [localCategories, setLocalCategories] = useState(selectedCategories);
  const [localSizes, setLocalSizes] = useState(selectedSizes);
  const [localSort, setLocalSort] = useState(selectedSort);

  useEffect(() => {
    setLocalCategories(selectedCategories);
  }, [selectedCategories]);

  useEffect(() => {
    setLocalSizes(selectedSizes);
  }, [selectedSizes]);

  useEffect(() => {
    setLocalSort(selectedSort);
  }, [selectedSort]);

  const normalizedCategories = useMemo(() => {
    return Array.isArray(categories)
      ? categories.filter(Boolean).map((cat) => ({
          value: String(cat),
          label: String(cat),
        }))
      : [];
  }, [categories]);

  const toggleCategory = (value) => {
    if (!value) return;
    if (multiCategory) {
      setLocalCategories((prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value]
      );
    } else {
      setLocalCategories((prev) => (prev[0] === value ? [] : [value]));
    }
  };

  const toggleSize = (value) => {
    if (!value) return;
    setLocalSizes((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleApply = () => {
    onApply?.({
      categories: localCategories,
      sizes: localSizes,
      sort: localSort,
    });
  };

  const handleClear = () => {
    setLocalCategories([]);
    setLocalSizes([]);
    setLocalSort('default');
    onClear?.();
  };

  return (
    <div className={clsx('filter-drawer', { open })}>
      <div className="filter-drawer__backdrop" onClick={onClose} />
      <div className="filter-drawer__panel">
        <div className="filter-drawer__header">
          <h3>{title}</h3>
          <button type="button" className="filter-drawer__close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="filter-drawer__content">
          <section className="filter-section">
            <h4>Sort by Price</h4>
            <div className="filter-options filter-options--radio">
              {PRICE_SORT_OPTIONS.map((option) => (
                <label key={option.value} className={clsx({ active: localSort === option.value })}>
                  <input
                    type="radio"
                    name="priceSort"
                    value={option.value}
                    checked={localSort === option.value}
                    onChange={(e) => setLocalSort(e.target.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </section>

          {normalizedCategories.length > 0 && (
            <section className="filter-section">
              <h4>Categories</h4>
              <div className="filter-options filter-options--pill">
                {normalizedCategories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    className={clsx('filter-pill', {
                      active: localCategories.includes(cat.value),
                    })}
                    onClick={() => toggleCategory(cat.value)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="filter-section">
            <h4>Please select the desired quantity and size</h4>
            <div className="filter-options filter-options--pill filter-options--multi">
              {QUANTITY_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={clsx('filter-pill text-uppercase', {
                    active: localSizes.includes(size),
                  })}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="filter-drawer__footer">
          <button type="button" className="btn btn-outline-secondary" onClick={handleClear}>
            Remove Filters
          </button>
          <button type="button" className="btn btn-dark" onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

FilterDrawer.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onApply: PropTypes.func,
  onClear: PropTypes.func,
  categories: PropTypes.array,
  selectedCategories: PropTypes.array,
  selectedSizes: PropTypes.array,
  selectedSort: PropTypes.string,
  multiCategory: PropTypes.bool,
  title: PropTypes.string,
};

export default FilterDrawer;
