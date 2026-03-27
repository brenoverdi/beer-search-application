<script setup>
import { ref } from 'vue'

const selectedCountry = ref('US')

const shops = {
  US: [
    {
      name: 'CraftShack',
      url: 'https://craftshack.com',
      description: 'Massive selection of American craft beers with nationwide shipping.',
      featuredBeer: { name: 'Pliny the Elder', brewery: 'Russian River', style: 'Double IPA', abv: '8.0%', rating: '4.9', price: '$8.99' }
    },
    {
      name: 'Tavour',
      url: 'https://tavour.com',
      description: 'Curated craft beer app featuring limited releases from independent breweries.',
      featuredBeer: { name: 'Julius', brewery: 'Tree House', style: 'NEIPA', abv: '6.8%', rating: '4.8', price: '$22/4-pack' }
    }
  ],
  UK: [
    {
      name: 'Beer Hawk',
      url: 'https://beerhawk.co.uk',
      description: 'The UK\'s leading online craft beer retailer with next-day delivery.',
      featuredBeer: { name: 'Punk IPA', brewery: 'BrewDog', style: 'IPA', abv: '5.4%', rating: '4.2', price: '£2.50' }
    }
  ],
  Brazil: [
    {
      name: 'Clube do Malte',
      url: 'https://clubedomalte.com.br',
      description: 'O maior clube de assinaturas e e-commerce de cervejas do Brasil.',
      featuredBeer: { name: 'Colorado Indica', brewery: 'Cervejaria Colorado', style: 'IPA', abv: '7.0%', rating: '4.5', price: 'R$18.90' }
    }
  ]
}
</script>

<template>
  <section class="my-12">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 border-l-4 border-amber-500 pl-4 py-1">
          🛒 Best Online Beer Shops
        </h2>
        <p class="text-gray-600 mt-2 max-w-2xl">
          Discover the top-rated retailers in your region and find the lowest prices on the best craft beers! Purchases support the Beer Search community.
        </p>
      </div>
      
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700">Region:</label>
        <select 
          v-model="selectedCountry" 
          class="border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500"
        >
          <option value="US">🇺🇸 United States</option>
          <option value="UK">🇬🇧 United Kingdom</option>
          <option value="Brazil">🇧🇷 Brazil</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="shop in shops[selectedCountry]" 
        :key="shop.name"
        class="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition duration-300 flex flex-col"
      >
        <div class="p-6 flex-1">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-2xl font-bold text-gray-900">{{ shop.name }}</h3>
            <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">Verified Retailer</span>
          </div>
          <p class="text-gray-600 mb-6 text-sm">{{ shop.description }}</p>

          <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
            <p class="text-xs text-amber-800 uppercase font-bold tracking-wider mb-2">🔥 Featured Steal</p>
            <div class="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
              <div>
                <p class="font-bold text-gray-900 leading-tight">{{ shop.featuredBeer.name }}</p>
                <p class="text-xs text-gray-500">{{ shop.featuredBeer.brewery }} • {{ shop.featuredBeer.style }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <p class="text-xs font-medium text-amber-600">⭐ {{ shop.featuredBeer.rating }}</p>
                  <p class="text-xs font-medium text-gray-600">🍺 {{ shop.featuredBeer.abv }} ABV</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-black text-green-600">{{ shop.featuredBeer.price }}</p>
                <a :href="shop.url" target="_blank" class="inline-block mt-1 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded hover:bg-amber-600 transition">
                  Buy Now
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-100 mt-auto">
          <a :href="shop.url" target="_blank" class="w-full text-center block text-sm font-semibold text-amber-600 hover:text-amber-700">
            Shop All Beers on {{ shop.name }} &rarr;
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
