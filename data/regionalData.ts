import { RegionDefinition } from '../types';

export const REGIONS: RegionDefinition[] = [
  {
    id: 'QUE',
    name: 'Quebec',
    parentCountryCode: 'CAN',
    flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Flag_of_Quebec.svg/320px-Flag_of_Quebec.svg.png',
    athletes: [
      // Moguls
      "Mikaël Kingsbury", "Elliot Vaillancourt", "Julien Viel", "Laurianne Desmarais-Gilbert", "Miha Fontaine",
      // Short Track
      "William Dandjinou", "Steven Dubois", "Jordan Pierre-Gilles", "Félix Roussel", "Kim Boutin", "Florence Brunelle", "Danaé Blais",
      // Long Track
      "Valérie Maltais", "Laurent Dubreuil", "Cédrick Brunet", "Béatrice Lamarche", "Antoine Gélinas-Beaulieu",
      // Snowboard
      "Éliot Grondin", "Laurie Blouin", "Eli Bouchard", "Arnaud Gaudet", "Audrey McManiman",
      // Alpine
      "Valérie Grenier", "Laurence St-Germain", "Justine Lamontagne",
      // Figure Skating
      "Maxime Deschamps", "Zachary Lagha", "Marjorie Lajoie", "Marie-Jade Lauriault", "Romain Le Gac",
      // Hockey/XC
      "Marie-Philip Poulin", "Antoine Cyr", "Katherine Stewart-Jones"
    ]
  },
  {
    id: 'SCO',
    name: 'Scotland',
    parentCountryCode: 'GBR',
    flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Flag_of_Scotland.svg/320px-Flag_of_Scotland.svg.png',
    athletes: [
      // Curling (Men)
      "Bruce Mouat", "Grant Hardie", "Bobby Lammie", "Hammy McMillan Jnr", "Kyle Waddell",
      // Curling (Women)
      "Rebecca Morrison", "Sophie Jackson", "Sophie Sinclair", "Jennifer Dodds", "Fay Henderson",
      // Freestyle Skiing
      "Kirsty Muir", "Chris McCormick",
      // Cross-Country
      "Andrew Musgrave", "James Clugnet", "Joe Davies",
      // Figure Skating
      "Lewis Gibson", "Anastasia Vaipan-Law"
    ]
  },
  {
    id: 'CAT',
    name: 'Catalonia',
    parentCountryCode: 'ESP',
    flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Flag_of_Catalonia.svg/320px-Flag_of_Catalonia.svg.png',
    athletes: [
      // Ski Mountaineering
      "Oriol Cardona Coll", "Ot Ferrer", "Maria Costa Díez",
      // Snowboard
      "Queralt Castellet", "Nora Cornell",
      // Cross-Country
      "Jaume Pueyo", "Bernat Sellés", "Marc Collell",
      // Alpine
      "Quim Salarich",
      // Figure Skating
      "Tomàs-Llorenç Guarino Sabaté",
      // Speed Skating
      "Nil Llop Izquierdo"
    ]
  }
];