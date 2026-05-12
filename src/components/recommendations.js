const recommendations = [
  {
    id: 1,
    comment: "O uso de cigarros eletrónicos está associado a maior risco de sintomas respiratórios, incluindo asma e DPOC (Doença Pulmonar Obstrutiva Crônica).",
    source: "https://pubmed.ncbi.nlm.nih.gov/41268099/"
  },
  {
    id: 2,
    comment: "Mesmo pessoas que nunca fumaram apresentam sinais de inflamação e dano pulmonar ao usar vape.",
    source: "https://pubmed.ncbi.nlm.nih.gov/41268099/"
  },
  {
    id: 3,
    comment: "Utilizar vape não elimina o risco pulmonar — em alguns casos, aproxima-o do risco de fumar cigarros tradicionais.",
    source: "https://pubmed.ncbi.nlm.nih.gov/41268099/"
  },
  {
    id: 4,
    comment: "Parar de usar vape reduz a exposição contínua a fatores associados a doença respiratória crónica.",
    source: "https://pubmed.ncbi.nlm.nih.gov/41268099/"
  },
  {
    id: 5,
    comment: "Quanto mais cedo se interrompe o uso de e-cigarros, menor o risco acumulado para os pulmões.",
    source: "https://pubmed.ncbi.nlm.nih.gov/41268099/"
  }
];

export function renderRecommendations() {
  return `
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Recomendações de Especialistas</h2>

      <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div class="flex flex-col items-center">
          <img
            src="/anasua_kundu.png"
            alt="Dra. Anasua Kundu"
            class="w-40 h-40 rounded-full object-cover border-4 border-blue-100 mb-4"
          />
          <h3 class="text-xl font-bold text-gray-800">Dra. Anasua Kundu</h3>
          <p class="text-sm text-blue-600 font-medium">Especialista em Saúde Respiratória</p>
        </div>
      </div>

      <div class="space-y-4">
        ${recommendations.map(rec => renderRecommendationCard(rec)).join('')}
      </div>
    </div>
  `;
}

function renderRecommendationCard(rec) {
  return `
    <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
      <p class="text-gray-700 mb-4 leading-relaxed">
        "${rec.comment}"
      </p>
      <a href="${rec.source}" target="_blank" rel="noopener noreferrer" class="text-sm text-blue-500 hover:text-blue-700 hover:underline inline-flex items-center gap-1">
        <span>Ver artigo científico</span>
        <span>→</span>
      </a>
    </div>
  `;
}
