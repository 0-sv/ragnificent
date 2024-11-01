class BM25 {
  constructor(k1 = 1.5, b = 0.75) {
    this.k1 = k1;
    this.b = b;
    this.corpus = [];
    this.avgDocLength = 0;
    this.docFreq = {};
    this.initialized = false;
  }

  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  addDocuments(documents) {
    this.corpus = documents.map(doc => this.tokenize(doc));
    this.avgDocLength = this.corpus.reduce((sum, doc) => sum + doc.length, 0) / this.corpus.length;
    
    // Calculate document frequencies
    this.docFreq = {};
    this.corpus.forEach(doc => {
      const terms = new Set(doc);
      terms.forEach(term => {
        this.docFreq[term] = (this.docFreq[term] || 0) + 1;
      });
    });
    
    this.initialized = true;
  }

  search(query, topK = 1) {
    if (!this.initialized) return [];
    
    const queryTerms = this.tokenize(query);
    const scores = this.corpus.map((doc, docIndex) => {
      let score = 0;
      const docLength = doc.length;
      
      queryTerms.forEach(term => {
        const tf = doc.filter(t => t === term).length;
        const df = this.docFreq[term] || 0;
        if (df === 0) return;
        
        const idf = Math.log((this.corpus.length - df + 0.5) / (df + 0.5) + 1);
        const numerator = tf * (this.k1 + 1);
        const denominator = tf + this.k1 * (1 - this.b + this.b * docLength / this.avgDocLength);
        score += idf * numerator / denominator;
      });
      
      return { index: docIndex, score };
    });
    
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(result => result.index);
  }
}

export default BM25;
