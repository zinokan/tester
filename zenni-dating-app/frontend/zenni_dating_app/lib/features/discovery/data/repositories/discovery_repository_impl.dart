import '../../domain/repositories/discovery_repository.dart';
import '../datasources/discovery_remote_datasource.dart';

class DiscoveryRepositoryImpl implements DiscoveryRepository {
  final DiscoveryRemoteDataSource remoteDataSource;

  DiscoveryRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<dynamic>> getPotentialMatches(int userId) async {
    // TODO: Implement get potential matches
    throw UnimplementedError();
  }
}