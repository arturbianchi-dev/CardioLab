# CardioLab — mathematical model provenance

## Core model

The current engine is a transparent educational 0D lumped-parameter circulation model. Its architecture follows the same modeling ideas documented in the supplied USP dissertation: systemic and pulmonary vascular compartments, resistances and compliances, pulsatile ventricles represented by variable elastance, active atrial pressure contributions, and conservation of mass.

The supplied dissertation describes an implementation based on Ursino (1998), with eight vascular compartments plus the four cardiac chambers, and reports visualization of pressure, flow, volume and pressure-volume loops. See the supplied source at the relevant model description and equations. fileciteturn73file0L39-L73

The dissertation's heart model uses a variable elastance representation: exponential end-diastolic pressure-volume behavior and a linear end-systolic pressure-volume relation, with Emax as the end-systolic elastance. fileciteturn72file1L57-L80

Several baseline ventricular parameters in the implementation are taken from the parameter table reproduced in the supplied dissertation, including Emax values, unstressed volumes and the 72 bpm baseline cycle. fileciteturn73file1L249-L264

## Guyton / venous return

The educational equilibrium view uses the Guyton concept that cardiac output and venous return meet at a common equilibrium. The supplied dissertation specifically describes shifting the cardiac-output curve and venous-return behavior as pressure and control variables change. fileciteturn72file7L369-L378

For the broader Guyton framework, see:

Guyton AC, Coleman TG, Granger HJ. *Circulation: Overall Regulation*. Annual Review of Physiology. 1972;34:13-44. DOI: 10.1146/annurev.ph.34.030172.000305.

## Variable elastance / baroreflex

Ursino's 1998 mathematical model couples variable-elastance right and left ventricles to systemic and pulmonary circulation and carotid baroreflex control. The model changes peripheral resistance, venous unstressed volume, heart period and end-systolic elastance in response to autonomic activity. https://doi.org/10.1152/ajpheart.1998.275.5.H1733

The supplied dissertation summarizes these features and identifies the 12-compartment structure, inertance in large arteries, splanchnic/extrasplanchnic separation and baroreflex control. fileciteturn72file0L11-L46

## Windkessel

The arterial pressure visualization uses a simplified lumped arterial model. It is intentionally labeled as such: the real arterial tree is not literally a single Windkessel. Westerhof et al. review the two- and three-element Windkessel representations and explain their limitations and relation to arterial wave phenomena.

Westerhof N, Lankhaar JW, Westerhof BE. *The arterial Windkessel*. Medical & Biological Engineering & Computing. 2009;47:131-141. DOI: 10.1007/s11517-008-0359-2.

## Multiscale limitation

A true high-fidelity cardiovascular simulator requires multiscale models. The supplied dissertation distinguishes lumped-parameter models from 1D/2D/3D approaches using Navier-Stokes and finite-element methods. fileciteturn73file2L285-L299

Therefore CardioLab should not describe its 0D engine as CFD or as a patient-specific digital twin. It is a physiology teaching laboratory whose equations are explicit and inspectable.

## Anatomy

The 3D anatomy layer uses publicly available reference assets rather than copied proprietary animation. The interface can combine the reference anatomy with the mathematical flow map. The visual diagrams in the application are original educational schematics, not reproductions of textbook figures.

## Transparency rule

Whenever a relationship is a didactic approximation, the UI should label it as such. Numerical outputs are model outputs, not predictions for an individual patient.
