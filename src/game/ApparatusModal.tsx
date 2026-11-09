import React from 'react';
import { ElectroApparatus } from './types';
import { soundEngine } from './audio';
import { X, Zap, Shield, Sparkles, BookOpen } from 'lucide-react';

interface ApparatusModalProps {
  apparatus: ElectroApparatus | null;
  onClose: () => void;
}

export const APPARATUS_ENCYCLOPEDIA: Record<string, {
  nameHu: string;
  nameEn: string;
  inventor: string;
  year: string;
  principleHu: string;
  gameplayRoleHu: string;
  color: string;
}> = {
  van_de_graaff: {
    nameHu: 'Van de Graaff-generátor',
    nameEn: 'Van de Graaff Generator',
    inventor: 'Robert J. Van de Graaff',
    year: '1929',
    principleHu: 'Szigetelő selyem- vagy gumiszalag folyamatosan hordja fel a dörzsöléssel nyert töltést a felső üreges fémgömbbe. Mivel a töltések a gömb külső felületére vándorolnak (Faraday-effektus), akár több millió voltos feszültségkülönbség is felhalmozódhat.',
    gameplayRoleHu: 'Azonos polaritás (+) esetén a gömb hatalmas Coulomb-taszítóerővel katapultálja a játékost a magasba, segítve az akadályok átugrását!',
    color: '#38bdf8'
  },
  leyden_jar: {
    nameHu: 'Leydeni palack',
    nameEn: 'Leyden Jar',
    inventor: 'Pieter van Musschenbroek & Ewald Georg von Kleist',
    year: '1745',
    principleHu: 'A történelem legelső elektromos kondenzátora. Egy üvegpalack külső és belső felületét fémfóliával (ón) vonták be. A dugón átnyúló fémpálca vezeti be a töltést, amely a dielektrikum (üveg) felületén tárolódik.',
    gameplayRoleHu: 'Kondenzátor egység: összegyűjtésükkel feltöltődik a játékos Coulomb-erőműve, vagy aktiválódnak a hidak és kijáratok!',
    color: '#f59e0b'
  },
  wimshurst: {
    nameHu: 'Wimshurst-gép (Befolyásológép)',
    nameEn: 'Wimshurst Influence Machine',
    inventor: 'James Wimshurst',
    year: '1883',
    principleHu: 'Két, egymással ellentétes irányban forgó szigetelőkorongból áll, melyekre radiálisan fémlemezkék vannak ragasztva. Elektrosztatikus megosztás (indukció) révén folyamatosan választ szét pozitív és negatív töltéseket, melyeket beépített Leydeni palackok sűrítenek a szikraköz elektródáihoz.',
    gameplayRoleHu: 'Veszélyes nagyfeszültségű akadály: ritmikus szikrákat lő át a levegőben. Használd a dasht a szikraköz átugrásához!',
    color: '#a855f7'
  },
  electroscope: {
    nameHu: 'Aranylemezes elektroszkóp',
    nameEn: 'Gold-Leaf Electroscope',
    inventor: 'Abraham Bennet',
    year: '1787',
    principleHu: 'Elektromos töltés kimutatására szolgáló érzékeny műszer. A felső fémlemezhez érintett töltés lefolyik a fémpálcán át a két ultravékony aranyfüst lemezkére. Mivel mindkettő azonos előjelű töltést kap, a Coulomb-taszítás miatt szétnyílnak egymástól.',
    gameplayRoleHu: 'Rugalmas rugóállomás: a játékos közeledtére szétnyíló lemezkék szuperugrást tesznek lehetővé magasabb szintekre!',
    color: '#eab308'
  },
  faraday_cage: {
    nameHu: 'Faraday-kalitka',
    nameEn: 'Faraday Cage',
    inventor: 'Michael Faraday',
    year: '1836',
    principleHu: 'Elektromosan vezető anyagból (fémháló, drótrács) készült zárt tér. Külső elektrosztatikus mező hatására a vezető elektronjai úgy rendeződnek át, hogy a kalitka belsejében a térerősség zérussá válik (E = 0), megvédve mindent, ami belül van.',
    gameplayRoleHu: 'Biztonsági zóna és mentési pont: a kalitkában tartózkodva semmilyen ellenséges lövedék vagy villámcsapás nem tehet kárt a játékosban!',
    color: '#10b981'
  }
};

export const ApparatusModal: React.FC<ApparatusModalProps> = ({ apparatus, onClose }) => {
  if (!apparatus) return null;

  const data = APPARATUS_ENCYCLOPEDIA[apparatus.type] || {
    nameHu: apparatus.infoTitle,
    nameEn: 'Electrostatic Device',
    inventor: 'Klasszikus fizika',
    year: 'XVIII–XIX. század',
    principleHu: apparatus.infoDesc,
    gameplayRoleHu: 'Kísérleti elektrosztatikai eszköz a pályán.',
    color: '#38bdf8'
  };

  const playZap = () => {
    soundEngine.playDash();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold tracking-wide font-pixel text-amber-300">
              Elektrosztatika Kódex
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Bezárás"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="mt-4 space-y-4 text-sm font-sans-ui">
          {/* Title and Inventor */}
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {data.nameHu}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {data.nameEn} · Feltaláló: <span className="text-slate-200 font-semibold">{data.inventor}</span> ({data.year})
            </p>
          </div>

          {/* Physical principle */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Fizikai Működési Elv</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {data.principleHu}
            </p>
          </div>

          {/* In-game mechanic */}
          <div className="p-3.5 bg-amber-950/20 border border-amber-900/40 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">
              <Zap className="w-4 h-4" />
              <span>Szerepe a Játékban & Stratégia</span>
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              {data.gameplayRoleHu}
            </p>
          </div>

          {/* Interactive spark sound tester & close */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={playZap}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-700/50 rounded-lg hover:bg-amber-900/40 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Szikra Tesztelés</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-sm"
            >
              Vissza a Játékhoz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
