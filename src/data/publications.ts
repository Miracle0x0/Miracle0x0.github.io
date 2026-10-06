interface Author {
  name: string;
  highlighted?: boolean;
  corresponding?: boolean;
}

interface Publication {
  title: string;
  titleUrl?: string;
  authors: Author[];
  conference: string;
  conferenceShort: string;
  year: number;
  image: string;
  imageAlt: string;
  links: { label: string; href: string }[];
}

export const publications: Publication[] = [{
  title: 'PopFetcher: Towards Accelerated Mixture-of-Experts Training Via Popularity Based Expert-Wise Prefetch',
  titleUrl: 'https://www.usenix.org/conference/atc25/presentation/zhang-junyi',
  authors: [
    { name: 'Junyi Zhang', highlighted: true },
    { name: 'Chuanhu Ma' },
    { name: 'Xiong Wang', corresponding: true },
    { name: 'Yuntao Nie' },
    { name: 'Yuqing Li' },
    { name: 'Yuedong Xu' },
    { name: 'Xiaofei Liao' },
    { name: 'Bo Li' },
    { name: 'Hai Jin' },
  ],
  conference: 'USENIX Annual Technical Conference',
  conferenceShort: 'USENIX ATC',
  year: 2025,
  image: '/assets/img/atc25-popfetcher.png',
  imageAlt: 'PopFetcher architecture and expert prefetching workflow',
  links: [
    { label: 'PDF', href: 'https://www.usenix.org/system/files/atc25-zhang-junyi.pdf' },
    { label: 'Slides', href: 'https://www.usenix.org/sites/default/files/conference/protected-files/atc25_slides-zhang_junyi.pdf' },
    { label: 'BibTeX', href: '/assets/bibtex/atc25-popfetcher.txt' },
  ],
}];
