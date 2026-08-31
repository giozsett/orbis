const horoscoposMalucos = {
  Aries: {
    signo: "Áries",
    distro: "Arch Linux",
    familia: "Independente",
    descricao:
      "Como Áries, você é aventureiro, direto e não tem medo de compilar seu próprio kernel. Arch Linux é para quem gosta de construir do zero, sem muletas — puro código e pura vontade.",
    caracteristicas: ["Rolling release", "DIY total", "Comunidade ativa"],
    cor: "#1793D1",
    observacao:
      "Arch não pergunta o que você quer fazer. Ele espera que você saiba. Assim como Áries.",
  },
  Touro: {
    signo: "Touro",
    distro: "Debian",
    familia: "Debian GNU/Linux",
    descricao:
      "Touro busca estabilidade, conforto e confiabilidade. Debian é o sistema que não muda por modinha — robusto como uma fazenda bem administrada.",
    caracteristicas: ["Estabilidade máxima", "Pacotes testados", "Suporte longo"],
    cor: "#A80030",
    observacao:
      "Debian é o software que você instala e esquece que existe — porque simplesmente funciona. Perfeito para Touro.",
  },
  Gemeos: {
    signo: "Gêmeos",
    distro: "Fedora",
    familia: "Red Hat",
    descricao:
      "Gêmeos adora novidades, variedade e conversas diferentes. Fedora é sempre um passo à frente, trazendo o que há de mais recente no ecossistema open source.",
    caracteristicas: ["Inovador", "RPM moderno", "Integra upstream"],
    cor: "#294172",
    observacao:
      "Fedora muda a cada seis meses. Gêmeos nem percebe — já está no próximo assunto.",
  },
  Cancer: {
    signo: "Câncer",
    distro: "Linux Mint",
    familia: "Ubuntu/Debian",
    descricao:
      "Câncer quer se sentir em casa. Linux Mint é acolhedor, familiar e feito para quem não quer complicação — só quer que as coisas funcionem com carinho.",
    caracteristicas: ["Amigável", "Familiar", "Estável"],
    cor: "#88C500",
    observacao:
      "Mint não tenta te impressionar. Ele quer te abraçar. Exatamente como Câncer faz com quem ama.",
  },
  Leao: {
    signo: "Leão",
    distro: "Pop!_OS",
    familia: "Ubuntu/Debian",
    descricao:
      "Leão gosta de brilhar, de ser notado e de ter controle. Pop!_OS tem uma identidade visual forte, suporte a GPUs e a ousadia de ser diferente — assim como Leão.",
    caracteristicas: ["Visual marcante", "Suporte GPU", "Automação de janelas"],
    cor: "#0095FF",
    observacao:
      "Pop!_OS é o sistema operacional que Leão usaria se quisesse dominar o stage — e o desktop.",
  },
  Virgem: {
    signo: "Virgem",
    distro: "NixOS",
    familia: "Nix",
    descricao:
      "Virgem é detalhista, metódica e busca perfeição. NixOS é declarativo, reprodutível eAuditável — um sistema que deixa tudo documentado e exatamente como foi definido.",
    caracteristicas: ["Declarativo", "Reprodutível", "Rollback"],
    cor: "#7EBAE4",
    observacao:
      "NixOS é o sonho de Virgem: cada pacote tem seu lugar, cada configuração tem seu arquivo, e nada acontece sem que você autorize.",
  },
  Libra: {
    signo: "Libra",
    distro: "elementary OS",
    familia: "Ubuntu/Debian",
    descricao:
      "Libra valoriza beleza, harmonia e equilíbrio. elementary OS é talvez o Linux mais bonito, com atenção obsessiva aos detalhes visuais e à experiência do usuário.",
    caracteristicas: ["Design refinado", "Coerência visual", "Simplicidade"],
    cor: "#64AFF4",
    observacao:
      "elementary OS não é só funcional — é elegante. Libra aprova com um sorriso e um clique suave.",
  },
  Escorpiao: {
    signo: "Escorpião",
    distro: "Kali Linux",
    familia: "Debian",
    descricao:
      "Escorpião é intenso, investigativo e não tem medo de ir às profundezas. Kali Linux é feito para pentesting e segurança — o território natural de quem gosta de desvendar segredos.",
    caracteristicas: ["Pentesting", "Ferramentas de segurança", "Auditoria"],
    cor: "#2D1138",
    observacao:
      "Kali não é para amadores. Escorpião não é amador. A correspondência é inevitável.",
  },
  Sagitario: {
    signo: "Sagitário",
    distro: "EndeavourOS",
    familia: "Arch Linux",
    descricao:
      "Sagitário ama liberdade, aventura e experiências novas. EndeavourOS é Arch com um sorriso — liberdade total com uma pitada de acolhimento para a jornada.",
    caracteristicas: ["Arch-based", "Acessível", "Comunidade acolhedora"],
    cor: "#5C328E",
    observacao:
      "EndeavourOS te dá o arco e as flechas de Arch, mas com um mapa e um café quente. Sagitário agradece.",
  },
  Capricornio: {
    signo: "Capricórnio",
    distro: "Rocky Linux",
    familia: "Enterprise",
    descricao:
      "Capricórnio é estratégico, persistente e pensa a longo prazo. Rocky Linux é enterprise-grade, estável e feito para quem precisa de algo que dure — sem surpresas.",
    caracteristicas: ["Enterprise", "Longo prazo", "Estabilidade"],
    cor: "#10B981",
    observacao:
      "Rocky Linux é o sistema que Capricórnio instala no servidor da empresa e nunca mais precisa reformular. Plano cumprido.",
  },
  Aquario: {
    signo: "Aquário",
    distro: "openSUSE Tumbleweed",
    familia: "SUSE",
    descricao:
      "Aquário é visionário, independente e gosta de experimentar. Tumbleweed é rolling release com qualidade absurda — inovação constante sem quebrar o sistema.",
    caracteristicas: ["Rolling release", "Btrfs/Snapper", "Comunidade openSUSE"],
    cor: "#73BA25",
    observacao:
      "Tumbleweed é o laboratório de Aquário: sempre atualizado, sempre funcional, sempre um passo à frente do futuro.",
  },
  Peixes: {
    signo: "Peixes",
    distro: "Ubuntu",
    familia: "Debian",
    descricao:
      "Peixes é sensível, acessível e se adapta a qualquer ambiente. Ubuntu é a distro mais popular do mundo — fácil de usar, fácil de encontrar ajuda, fácil de viver.",
    caracteristicas: ["Popular", "Acessível", "Gran base de usuários"],
    cor: "#E95420",
    observacao:
      "Ubuntu é o sistema que todo mundo conhece e ninguém discorda. Peixes flui naturalmente com a maré — e a maré é Ubuntu.",
  },
};

export const signos = Object.keys(horoscoposMalucos);

export const obterHoroscopoMaluco = (signo) => {
  if (!signo) return null;
  const chave = signo.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const chaveLower = chave.charAt(0).toUpperCase() + chave.slice(1).toLowerCase();
  return horoscoposMalucos[chaveLower] || null;
};

export default horoscoposMalucos;
