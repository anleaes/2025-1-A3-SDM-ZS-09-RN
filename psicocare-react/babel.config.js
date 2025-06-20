module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    //plugins: ['nativewind/babel'], // plugin do nativewind corretamente inserido aqui
  };
};
