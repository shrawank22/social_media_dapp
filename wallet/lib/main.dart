import 'package:get_it/get_it.dart';
import 'package:get_it_mixin/get_it_mixin.dart';
import 'package:walletconnect_flutter_v2_wallet/dependencies/bottom_sheet/bottom_sheet_listener.dart';
import 'package:walletconnect_flutter_v2_wallet/dependencies/bottom_sheet/bottom_sheet_service.dart';
import 'package:walletconnect_flutter_v2_wallet/dependencies/bottom_sheet/i_bottom_sheet_service.dart';
import 'package:walletconnect_flutter_v2_wallet/dependencies/chains/cosmos_service.dart';
import 'package:walletconnect_flutter_v2_wallet/dependencies/chains/evm_service.dart';
import 'package:walletconnect_flutter_v2_wallet/dependencies/chains/kadena_service.dart';
import 'package:walletconnect_flutter_v2_wallet/dependencies/chains/polkadot_service.dart';
import 'package:walletconnect_flutter_v2_wallet/dependencies/chains/solana_service.dart';
import 'package:walletconnect_flutter_v2_wallet/dependencies/deep_link_handler.dart';
import 'package:walletconnect_flutter_v2_wallet/dependencies/i_web3wallet_service.dart';
import 'package:walletconnect_flutter_v2_wallet/dependencies/key_service/i_key_service.dart';
import 'package:walletconnect_flutter_v2_wallet/dependencies/key_service/key_service.dart';
import 'package:walletconnect_flutter_v2_wallet/dependencies/web3wallet_service.dart';
import 'package:walletconnect_flutter_v2_wallet/models/chain_data.dart';
import 'package:walletconnect_flutter_v2_wallet/models/chain_metadata.dart';
import 'package:walletconnect_flutter_v2_wallet/models/page_data.dart';
import 'package:walletconnect_flutter_v2_wallet/pages/apps_page.dart';
import 'package:walletconnect_flutter_v2_wallet/pages/settings_page.dart';
import 'package:walletconnect_flutter_v2_wallet/utils/constants.dart';
import 'package:flutter/material.dart';
import 'package:walletconnect_flutter_v2_wallet/utils/string_constants.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  DeepLinkHandler.initListener();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: StringConstants.appTitle,
      home: MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget with GetItStatefulWidgetMixin {
  MyHomePage({super.key});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> with GetItStateMixin {
  bool _initializing = true;

  List<PageData> _pageDatas = [];
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    initialize();
  }

  Future<void> initialize() async {
    GetIt.I.registerSingleton<IBottomSheetService>(BottomSheetService());
    GetIt.I.registerSingleton<IKeyService>(KeyService());

    final IWeb3WalletService web3WalletService = Web3WalletService();
    await web3WalletService.create();
    GetIt.I.registerSingleton<IWeb3WalletService>(web3WalletService);

    // Support EVM Chains
    final evmChains =
        ChainData.allChains.where((c) => c.type == ChainType.eip155).toList();
    for (final chainData in evmChains) {
      GetIt.I.registerSingleton<EVMService>(
        EVMService(chainSupported: chainData),
        instanceName: chainData.chainId,
      );
    }

    // Support Kadena Chains
    final kadenaChains =
        ChainData.allChains.where((c) => c.type == ChainType.kadena).toList();
    for (final chainData in kadenaChains) {
      GetIt.I.registerSingleton<KadenaService>(
        KadenaService(chainSupported: chainData),
        instanceName: chainData.chainId,
      );
    }

    // Support Polkadot Chains
    final polkadotChains =
        ChainData.allChains.where((c) => c.type == ChainType.polkadot).toList();
    for (final chainData in polkadotChains) {
      GetIt.I.registerSingleton<PolkadotService>(
        PolkadotService(chainSupported: chainData),
        instanceName: chainData.chainId,
      );
    }

    // Support Solana Chains
    final solanaChains =
        ChainData.allChains.where((c) => c.type == ChainType.solana).toList();
    for (final chainData in solanaChains) {
      GetIt.I.registerSingleton<SolanaService>(
        SolanaService(chainSupported: chainData),
        instanceName: chainData.chainId,
      );
    }

    // Support Cosmos Chains
    final cosmosChains =
        ChainData.allChains.where((c) => c.type == ChainType.cosmos).toList();
    for (final chainData in cosmosChains) {
      GetIt.I.registerSingleton<CosmosService>(
        CosmosService(chainSupported: chainData),
        instanceName: chainData.chainId,
      );
    }

    await web3WalletService.init();

    setState(() {
      _pageDatas = [
        PageData(
          page: AppsPage(),
          title: StringConstants.connectPageTitle,
          icon: Icons.swap_vert_circle_outlined,
        ),
        PageData(
          page: const Center(
            child: Text(
              'Inbox (Not Implemented)',
              style: StyleConstants.bodyText,
            ),
          ),
          title: 'Inbox',
          icon: Icons.inbox_rounded,
        ),
        PageData(
          page: const SettingsPage(),
          title: 'Settings',
          icon: Icons.settings_outlined,
        ),
      ];

      _initializing = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_initializing) {
      return const Material(
        child: Center(
          child: CircularProgressIndicator(
            color: StyleConstants.primaryColor,
          ),
        ),
      );
    }

    final List<Widget> navRail = [];
    if (MediaQuery.of(context).size.width >= Constants.smallScreen) {
      navRail.add(_buildNavigationRail());
    }
    navRail.add(
      Expanded(
        child: _pageDatas[_selectedIndex].page,
      ),
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(
          _pageDatas[_selectedIndex].title,
          style: const TextStyle(color: Colors.black),
        ),
      ),
      body: BottomSheetListener(
        child: Row(
          mainAxisSize: MainAxisSize.max,
          children: navRail,
        ),
      ),
      bottomNavigationBar:
          MediaQuery.of(context).size.width < Constants.smallScreen
              ? _buildBottomNavBar()
              : null,
    );
  }

  Widget _buildBottomNavBar() {
    return BottomNavigationBar(
      currentIndex: _selectedIndex,
      unselectedItemColor: Colors.grey,
      selectedItemColor: Colors.black,
      // called when one tab is selected
      onTap: (int index) {
        setState(() {
          _selectedIndex = index;
        });
      },
      // bottom tab items
      items: _pageDatas
          .map(
            (e) => BottomNavigationBarItem(
              icon: Icon(e.icon),
              label: e.title,
            ),
          )
          .toList(),
    );
  }

  Widget _buildNavigationRail() {
    return NavigationRail(
      // backgroundColor: StyleConstants.backgroundColor,
      selectedIndex: _selectedIndex,
      onDestinationSelected: (int index) {
        setState(() {
          _selectedIndex = index;
        });
      },
      labelType: NavigationRailLabelType.selected,
      destinations: _pageDatas
          .map(
            (e) => NavigationRailDestination(
              icon: Icon(e.icon),
              label: Text(e.title),
            ),
          )
          .toList(),
    );
  }
}
