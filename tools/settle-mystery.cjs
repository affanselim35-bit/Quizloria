/* Trusted local season closer. Uses the existing Firebase CLI login, never browser credentials.
 * Default dry run. --apply writes only allowlisted season scores, awards and entitlements.
 * --fixture <json> [--now <ms>] is a no-network test mode and cannot be combined with --apply.
 */
const fs=require('fs'),path=require('path'),os=require('os'),{execFileSync}=require('child_process');
const core=require('../daily-mystery-core.js');
function settle(data,now){
 const patch={},report=[];
 for(const [month,season] of Object.entries(data.mysterySeasons||{}).sort()){
  if(!/^\d{4}-\d{2}$/.test(month)||!Number.isFinite(season.closesAt)||!Number.isFinite(season.rewardEndsAt)||season.closesAt>now||data.mysteryAwards?.[month])continue;
  const scores=core.replay(month,data.mysteryKeys,data.mysteryAttempts,data.socialProfiles),ranking=core.rank(scores),winner=ranking.find(x=>x.points>0);
  patch['mysteryScores/'+month]=scores;
  patch['mysteryAwards/'+month]={name:winner?.name||'',points:winner?.points||0,decidedAt:now,activeFrom:season.closesAt,expiresAt:season.rewardEndsAt,...(winner?{uid:winner.uid}:{})};
  if(winner&&now<season.rewardEndsAt&&!(data.mysteryEntitlements?.[winner.uid]?.expiresAt>season.rewardEndsAt))patch['mysteryEntitlements/'+winner.uid]={season:month,activeFrom:season.closesAt,expiresAt:season.rewardEndsAt};
  report.push({month,participants:ranking.length,winner:winner?.name||null,points:winner?.points||0,rewardActive:!!winner&&now<season.rewardEndsAt});
 }
 return {patch,report};
}
async function main(){
 const args=process.argv.slice(2),fixture=args.includes('--fixture')?args[args.indexOf('--fixture')+1]:null,apply=args.includes('--apply');
 if(fixture){if(apply)throw Error('Fixture cannot write production');const now=args.includes('--now')?Number(args[args.indexOf('--now')+1]):Date.now();console.log(JSON.stringify(settle(JSON.parse(fs.readFileSync(fixture,'utf8')),now)));return}
 if(args.includes('--now'))throw Error('Production uses the real clock only');
 const source=path.resolve(__dirname,'..'),cli=path.resolve(source,'../firebase-cli/node_modules/firebase-tools/lib/bin/firebase.js');
 if(!fs.existsSync(cli))throw Error('Existing local Firebase CLI installation not found');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'quizloria-season-')),files=[];
 const env={...process.env,XDG_CONFIG_HOME:path.resolve(source,'../firebase-config')};
 function run(args){execFileSync(process.execPath,[cli,...args,'--project','quizora-b1497','--instance','quizora-b1497-default-rtdb'],{cwd:source,env,stdio:['ignore','pipe','pipe'],timeout:120000})}
 try{
  const data={};for(const key of ['mysterySeasons','mysteryKeys','mysteryAttempts','mysteryAwards','mysteryEntitlements','socialProfiles']){const file=path.join(dir,key+'.json');files.push(file);run(['database:get','/'+key,'--output',file]);data[key]=JSON.parse(fs.readFileSync(file,'utf8'))||{}}
  const result=settle(data,Date.now());
  if(apply&&Object.keys(result.patch).length){const file=path.join(dir,'patch.json');files.push(file);fs.writeFileSync(file,JSON.stringify(result.patch));run(['database:update','/',file,'--force'])}
  const scheduledThrough=Object.keys(data.mysteryKeys).sort().at(-1)||null;
  console.log(JSON.stringify({applied:apply&&Object.keys(result.patch).length>0,seasons:result.report,scheduledThrough,needsContent:!scheduledThrough||Date.parse(scheduledThrough+'T00:00:00+03:00')-Date.now()<7*86400000}));
 }finally{for(const file of files)if(fs.existsSync(file))fs.unlinkSync(file);fs.rmdirSync(dir)}
}
if(require.main===module)main().catch(e=>{console.error('Season settlement failed:',e.message);process.exitCode=1});
module.exports={settle};

